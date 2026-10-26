import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axios'
import { NavLink } from 'react-router';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/get_All_Problem');
      setProblems(data.getAllProblem || []);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete the editorial video for this problem?')) return;
    
    try {
      setError(null);
      setNotice('');
      await axiosClient.delete(`/video/delete/${id}`);
      setNotice('Editorial video deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete editorial video.');
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current wrap-flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.response?.data?.error || error.message || error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Editorial videos</h1>
          <p className="mt-1 text-base-content/70">
            Upload or delete solution videos for your coding problems.
          </p>
        </div>
        <NavLink to="/admin" className="btn btn-ghost">
          Back to admin
        </NavLink>
      </div>

      {notice && <div className="alert alert-success mb-4">{notice}</div>}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-4/12">Title</th>
              <th className="w-2/12">Difficulty</th>
              <th className="w-3/12">Tags</th>
              <th className="w-3/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>
                <td>{problem.title}</td>
                <td>
                  <span className={`badge ${
                    problem.difficulty === 'Easy' 
                      ? 'badge-success' 
                      : problem.difficulty === 'Medium' 
                        ? 'badge-warning' 
                        : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                     <NavLink 
                        to={`/admin/upload/${problem._id}`}
                        className="btn btn-sm btn-info"
                        >
                        Upload / replace
                    </NavLink>
                    <button 
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete video
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideo;