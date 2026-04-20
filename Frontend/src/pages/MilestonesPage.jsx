import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MilestoneTracker from '../components/MilestoneTracker';
import Navbar from '../components/Navbar';

const MilestonesPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft size={18} /> Back to Project Details
        </Link>
        <MilestoneTracker projectId={id} />
      </main>
    </div>
  );
};

export default MilestonesPage;