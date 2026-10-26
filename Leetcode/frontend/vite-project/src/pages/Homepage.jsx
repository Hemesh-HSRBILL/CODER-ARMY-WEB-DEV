import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from "../utils/axios";
import { logoutUser } from "../slice/authSlice";

function Homepage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: "all",
        tag: "all",
        status: "all"
    });

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await axiosClient.get("/problem/get_All_Problem");
                setProblems(data.getAllProblem || []);
            } catch (error) {
                console.error('Error fetching problems:', error);
            }
        };

        const fetchSolvedProblems = async () => {
            try {
                const { data } = await axiosClient.get("/problem/solvedProblem");
                setSolvedProblems(data || []);
            } catch (error) {
                console.error('Error fetching problems:', error);
            }
        };
        
        fetchProblems();
        if (user) {
            fetchSolvedProblems();
        }
    }, [user]);

    const filteredProblems = problems.filter((problem) => {
        const difficultyMatch = filters.difficulty === "all" || problem.difficulty === filters.difficulty;
        const tagMatch = filters.tag === "all" || problem.tag === filters.tag;
        const statusMatch =
            filters.status === 'all' ||
            (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));

        return difficultyMatch && tagMatch && statusMatch;
    });

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 antialiased relative overflow-x-hidden selection:bg-indigo-500/30">
            
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
                    <NavLink to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-80 transition">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                            </svg>
                        </div>
                        ApexX
                    </NavLink>
                    
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                                {user?.firstName || 'User'}
                            </span>
                        </div>
                        <ul tabIndex={0} className="mt-2 p-2 shadow-2xl menu menu-sm dropdown-content bg-slate-900 border border-slate-800 rounded-xl w-52 text-slate-300">
                            {user?.role === "admin" && (
                                <li>
                                    <NavLink to="/admin" className="hover:bg-white/5 hover:text-white rounded-lg py-2">Admin Panel</NavLink>
                                </li>
                            )}
                            <li>
                                <button onClick={handleLogout} className="hover:bg-rose-500/10 hover:text-rose-400 rounded-lg py-2">Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Problem Set</h1>
                    <p className="text-slate-400 text-base">Master algorithms and data structures. Pick a challenge and start coding.</p>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-2 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                    
                    {/* Status Filter */}
                    <div className="relative group flex-1 min-w-[140px]">
                        <select 
                            className="w-full appearance-none bg-transparent text-sm text-slate-200 py-2.5 pl-9 pr-8 rounded-xl hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="all" className="bg-slate-900">All Problems</option>
                            <option value="solved" className="bg-slate-900">Solved Problems</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                    {/* Difficulty Filter */}
                    <div className="relative group flex-1 min-w-[140px]">
                        <select 
                            className="w-full appearance-none bg-transparent text-sm text-slate-200 py-2.5 pl-9 pr-8 rounded-xl hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                            value={filters.difficulty}
                            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                        >
                            <option value="all" className="bg-slate-900">All Difficulties</option>
                            <option value="easy" className="bg-slate-900">Easy</option>
                            <option value="medium" className="bg-slate-900">Medium</option>
                            <option value="hard" className="bg-slate-900">Hard</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-amber-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                    {/* Tag Filter */}
                    <div className="relative group flex-1 min-w-[140px]">
                        <select 
                            className="w-full appearance-none bg-transparent text-sm text-slate-200 py-2.5 pl-9 pr-8 rounded-xl hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                            value={filters.tag}
                            onChange={(e) => setFilters({...filters, tag: e.target.value})}
                        >
                            <option value="all" className="bg-slate-900">All Tags</option>
                            <option value="array" className="bg-slate-900">Array</option>
                            <option value="linkedList" className="bg-slate-900">Linked List</option>
                            <option value="graph" className="bg-slate-900">Graph</option>
                            <option value="dp" className="bg-slate-900">DP</option>
                            <option value="stack" className="bg-slate-900">Stack</option>
                            <option value="queue" className="bg-slate-900">Queue</option>
                            <option value="tree" className="bg-slate-900">Tree</option> 
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sky-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                <div className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-2xl shadow-black/50">
                    
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 bg-white/[0.02] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-white/5">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-6">Title</div>
                        <div className="col-span-2">Tag</div>
                        <div className="col-span-3 text-right">Difficulty</div>
                    </div>

                    {/* List Items */}
                    <div className="divide-y divide-white/5">
                        {filteredProblems.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                                <svg className="w-12 h-12 mb-4 opacity-50 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p>No problems found matching your filters.</p>
                            </div>
                        ) : (
                            filteredProblems.map(problem => (
                                <div key={problem._id} className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer">
                                    
                                    {/* Left accent border on hover based on difficulty */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${getHoverAccentColor(problem.difficulty)}`}></div>
                                    
                                    {/* Status Column */}
                                    <div className="col-span-1 flex justify-start md:justify-center">
                                        {solvedProblems.some(sp => sp._id === problem._id) ? (
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        ) : (
                                            <span className="w-7 h-7 flex items-center justify-center text-slate-700">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </span>
                                        )}
                                    </div>

                                    {/* Title Column */}
                                    <div className="col-span-6 font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                                        <NavLink to={`/problem/${problem._id}`} className="block w-full">
                                            {problem.title}
                                        </NavLink>
                                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </div>

                                    {/* Tag Column */}
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                                            {problem.tag}
                                        </span>
                                    </div>

                                    {/* Difficulty Column */}
                                    <div className="col-span-3 flex justify-start md:justify-end">
                                        <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getDifficultyBadgeColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const getDifficultyBadgeColor = (difficulty = '') => {
    switch (difficulty.toLowerCase()) {
        case 'easy': 
            return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
        case 'medium': 
            return 'bg-amber-500/10 text-amber-400 ring-amber-500/20';
        case 'hard': 
            return 'bg-rose-500/10 text-rose-400 ring-rose-500/20';
        default: 
            return 'bg-slate-500/10 text-slate-400 ring-slate-500/20';
    }
};

const getHoverAccentColor = (difficulty = '') => {
    switch (difficulty.toLowerCase()) {
        case 'easy': return 'bg-emerald-500';
        case 'medium': return 'bg-amber-500';
        case 'hard': return 'bg-rose-500';
        default: return 'bg-indigo-500';
    }
};

export default Homepage;