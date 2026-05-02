import cron from "node-cron";
import FundingOpportunity from "../models/FundingOpportunity.js";
import GrantApplication from "../models/GrantApplication.js";
import Milestone from "../models/Milestone.js";
import ReminderLog from "../models/ReminderLog.js";
import { sendEmail } from "../utils/email.js";

// const REMINDER_DAYS = [7, 3, 1];
const REMINDER_HOURS = [24];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const alreadySent = async ({ type, targetId, email, daysBefore }) => {
  const reminderKey = `${type}:${targetId}:${email}:${daysBefore}`;
  const existing = await ReminderLog.findOne({ reminderKey });
  if (existing) return true;

  await ReminderLog.create({
    type,
    targetId,
    userEmail: email,
    reminderKey,
  });

  return false;
};

// const sendGrantDeadlineReminders = async () => {
//   for (const daysBefore of REMINDER_DAYS) {
//     const targetDate = addDays(new Date(), daysBefore);

//     const opportunities = await FundingOpportunity.find({
//       deadline: {
//         $gte: startOfDay(targetDate),
//         $lte: endOfDay(targetDate),
//       },
//     }).populate("postedBy", "username email");

//     for (const funding of opportunities) {
//       const applications = await GrantApplication.find({
//         fundingOpportunity: funding._id,
//         status: { $in: ["submitted", "under_review"] },
//       }).populate("applicant", "username email");

//       const recipients = new Map();

//       if (funding.postedBy?.email) {
//         recipients.set(funding.postedBy.email, funding.postedBy.username || "there");
//       }

//       applications.forEach((app) => {
//         if (app.applicant?.email) {
//           recipients.set(app.applicant.email, app.applicant.username || "there");
//         }
//       });

//       for (const [email, name] of recipients.entries()) {
//         const sent = await alreadySent({
//           type: "grant_deadline",
//           targetId: funding._id,
//           email,
//           daysBefore,
//         });

//         if (sent) continue;

//         await sendEmail({
//           to: email,
//           subject: `Grant deadline reminder: ${funding.grantTitle}`,
//           html: `
//             <h2>Grant Deadline Reminder</h2>
//             <p>Hello ${name},</p>
//             <p>The grant <strong>${funding.grantTitle}</strong> deadline is in <strong>${daysBefore} day(s)</strong>.</p>
//             <p><strong>Deadline:</strong> ${new Date(funding.deadline).toDateString()}</p>
//             <p>Please review or complete any required actions before the deadline.</p>
//             <p>— ResearchConnect</p>
//           `,
//         });
//       }
//     }
//   }
// };

const sendGrantDeadlineReminders = async () => {
  const now = new Date();

  for (const hoursBefore of REMINDER_HOURS) {
    const targetTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    const windowStart = new Date(targetTime.getTime() - 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 60 * 1000);

    const opportunities = await FundingOpportunity.find({
      deadline: {
        $gte: windowStart,
        $lte: windowEnd,
      },
    }).populate("postedBy", "username email");

    for (const funding of opportunities) {
      const applications = await GrantApplication.find({
        fundingOpportunity: funding._id,
        status: { $in: ["submitted", "under_review"] },
      }).populate("applicant", "username email");

      const recipients = new Map();

      if (funding.postedBy?.email) {
        recipients.set(funding.postedBy.email, funding.postedBy.username || "there");
      }

      applications.forEach((app) => {
        if (app.applicant?.email) {
          recipients.set(app.applicant.email, app.applicant.username || "there");
        }
      });

      for (const [email, name] of recipients.entries()) {
        const reminderKey = `grant_deadline:${funding._id}:${email}:24_hours_before`;

        const existing = await ReminderLog.findOne({ reminderKey });
        if (existing) continue;

        await ReminderLog.create({
          type: "grant_deadline",
          targetId: funding._id,
          userEmail: email,
          reminderKey,
        });

        await sendEmail({
          to: email,
          subject: `Grant deadline reminder: ${funding.grantTitle}`,
          html: `
            <h2>Grant Deadline Reminder</h2>
            <p>Hello ${name},</p>
            <p>The grant <strong>${funding.grantTitle}</strong> deadline is in approximately <strong>24 hours</strong>.</p>
            <p><strong>Deadline:</strong> ${new Date(funding.deadline).toLocaleString()}</p>
            <p>— ResearchConnect</p>
          `,
        });
      }
    }
  }
};

// const sendMilestoneDeadlineReminders = async () => {
//   for (const daysBefore of REMINDER_DAYS) {
//     const targetDate = addDays(new Date(), daysBefore);

//     const milestones = await Milestone.find({
//       status: { $ne: "Completed" },
//       deadline: {
//         $gte: startOfDay(targetDate),
//         $lte: endOfDay(targetDate),
//       },
//     }).populate({
//       path: "projectId",
//       populate: {
//         path: "owner",
//         select: "username email",
//       },
//     });

//     for (const milestone of milestones) {
//       const owner = milestone.projectId?.owner;
//       if (!owner?.email) continue;

//       const sent = await alreadySent({
//         type: "milestone_deadline",
//         targetId: milestone._id,
//         email: owner.email,
//         daysBefore,
//       });

//       if (sent) continue;

//       await sendEmail({
//         to: owner.email,
//         subject: `Milestone reminder: ${milestone.title}`,
//         html: `
//           <h2>Project Milestone Reminder</h2>
//           <p>Hello ${owner.username || "there"},</p>
//           <p>Your milestone <strong>${milestone.title}</strong> is due in <strong>${daysBefore} day(s)</strong>.</p>
//           <p><strong>Project:</strong> ${milestone.projectId?.title || "Untitled Project"}</p>
//           <p><strong>Deadline:</strong> ${new Date(milestone.deadline).toDateString()}</p>
//           <p>— ResearchConnect</p>
//         `,
//       });
//     }
//   }
// };

const sendMilestoneDeadlineReminders = async () => {
  const now = new Date();

  for (const hoursBefore of REMINDER_HOURS) {
    const targetTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    const windowStart = new Date(targetTime.getTime() - 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 60 * 1000);

    const milestones = await Milestone.find({
      status: { $ne: "Completed" },
      deadline: {
        $gte: windowStart,
        $lte: windowEnd,
      },
    }).populate({
      path: "projectId",
      populate: {
        path: "owner",
        select: "username email",
      },
    });

    for (const milestone of milestones) {
      const owner = milestone.projectId?.owner;
      if (!owner?.email) continue;

      const reminderKey = `milestone_deadline:${milestone._id}:${owner.email}:24_hours_before`;

      const existing = await ReminderLog.findOne({ reminderKey });
      if (existing) continue;

      await ReminderLog.create({
        type: "milestone_deadline",
        targetId: milestone._id,
        userEmail: owner.email,
        reminderKey,
      });

      await sendEmail({
        to: owner.email,
        subject: `Milestone reminder: ${milestone.title}`,
        html: `
          <h2>Project Milestone Reminder</h2>
          <p>Hello ${owner.username || "there"},</p>
          <p>Your milestone <strong>${milestone.title}</strong> is due in approximately <strong>24 hours</strong>.</p>
          <p><strong>Project:</strong> ${milestone.projectId?.title || "Untitled Project"}</p>
          <p><strong>Deadline:</strong> ${new Date(milestone.deadline).toLocaleString()}</p>
          <p>— ResearchConnect</p>
        `,
      });
    }
  }
};

export const sendDailyReminders = async () => {
  await sendGrantDeadlineReminders();
  await sendMilestoneDeadlineReminders();
};

export const startReminderJob = () => {
//   cron.schedule("0 9 * * *", async () => {
    cron.schedule("* * * * *", async () => {
    try {
      console.log("Running daily reminder job...");
      await sendDailyReminders();
      console.log("Daily reminder job completed.");
    } catch (error) {
      console.error("Reminder job failed:", error.message);
    }
  });

//   console.log("Reminder job scheduled for 9:00 AM daily.");
     console.log("Reminder job scheduled to run every minute.");
};