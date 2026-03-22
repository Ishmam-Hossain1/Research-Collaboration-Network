import Navbar from "../components/Navbar";

const Homepage = () => {
  return (
    <div className="homepage animated-bg">
      <Navbar />

      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">Research Collaboration Platform</div>
            <h1 className="hero-title">
              Promote Your <span>Research</span> and Collaborations
            </h1>
            <p className="hero-subtitle">
              Discover collaborators, showcase your projects, and connect with
              researchers across disciplines. Built for academics, students, and
              industry partners.
            </p>

            <div className="hero-actions">
              <button className="btn-primary">See Projects</button>
              <button className="btn-outline">Find Collaborators</button>
            </div>
          </div>

          <div className="hero-illustration" aria-hidden="true">
            <div className="hero-rocket" />
            <div className="hero-orbit" />
            <div className="hero-dot hero-dot--1" />
            <div className="hero-dot hero-dot--2" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;