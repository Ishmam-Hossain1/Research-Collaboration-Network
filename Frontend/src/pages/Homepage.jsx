import Navbar from "../components/Navbar";

const Homepage = () => {
  return (
    <div className="homepage">
      <Navbar />

      <div className="hero-section">
        <div className="profile-card">
          <div className="profile-image">
            Picture of the person
          </div>

          <div className="profile-info">
            <h1>Daniel Tenant</h1>
            <p>Professor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;