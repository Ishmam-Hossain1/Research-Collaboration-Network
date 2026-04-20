import FundingOpportunity from "../models/FundingOpportunity.js";

export const createFundingOpportunity = async (req, res) => {
  try {
    // console.log("req.body:", req.body);
    const { grantTitle, fundingAmount, deadline, eligibilityCriteria, postedBy } = req.body;

    if (!grantTitle || !fundingAmount || !deadline || !eligibilityCriteria || !postedBy) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newFundingOpportunity = await FundingOpportunity.create({
      grantTitle,
      fundingAmount,
      deadline,
      eligibilityCriteria,
      postedBy,
    });

    res.status(201).json({
      message: "Funding opportunity created successfully",
      funding: newFundingOpportunity,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating funding opportunity",
      error: error.message,
    });
  }
};

// export const getAllFundingOpportunities = async (req, res) => {
//   try {
//     const fundingOpportunities = await FundingOpportunity.find().sort({
//       createdAt: -1,
//     });

//     res.status(200).json(fundingOpportunities);
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching funding opportunities",
//       error: error.message,
//     });
//   }
// };

export const getAllFundingOpportunities = async (req, res) => {
  try {
    const fundingOpportunities = await FundingOpportunity.find()
      .populate("postedBy", "username email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(fundingOpportunities);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching funding opportunities",
      error: error.message,
    });
  }
};

// export const getFundingOpportunityById = async (req, res) => {
//   try {
//     const fundingOpportunity = await FundingOpportunity.findById(req.params.id);

//     if (!fundingOpportunity) {
//       return res.status(404).json({ message: "Funding opportunity not found" });
//     }

//     res.status(200).json(fundingOpportunity);
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching funding opportunity",
//       error: error.message,
//     });
//   }
// };

export const getFundingOpportunityById = async (req, res) => {
  try {
    const fundingOpportunity = await FundingOpportunity.findById(req.params.id)
      .populate("postedBy", "username email");

    if (!fundingOpportunity) {
      return res.status(404).json({ message: "Funding opportunity not found" });
    }

    res.status(200).json(fundingOpportunity);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching funding opportunity",
      error: error.message,
    });
  }
};

export const updateFundingOpportunity = async (req, res) => {
  try {
    const { grantTitle, fundingAmount, deadline, eligibilityCriteria } = req.body;

    const updatedFundingOpportunity = await FundingOpportunity.findByIdAndUpdate(
      req.params.id,
      {
        grantTitle,
        fundingAmount,
        deadline,
        eligibilityCriteria,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFundingOpportunity) {
      return res.status(404).json({ message: "Funding opportunity not found" });
    }

    res.status(200).json({
      message: "Funding opportunity updated successfully",
      funding: updatedFundingOpportunity,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating funding opportunity",
      error: error.message,
    });
  }
};

export const deleteFundingOpportunity = async (req, res) => {
  try {
    const deletedFundingOpportunity = await FundingOpportunity.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFundingOpportunity) {
      return res.status(404).json({ message: "Funding opportunity not found" });
    }

    res.status(200).json({
      message: "Funding opportunity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting funding opportunity",
      error: error.message,
    });
  }
};