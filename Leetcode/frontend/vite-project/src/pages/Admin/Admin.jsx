import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const actions = [
    {
        title: 'Create problem',
        description: 'Add a new coding challenge to the problem set.',
        button: 'Create',
        color: 'btn-indigo',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
        )
    },
    {
        title: 'Update problem',
        description: 'Edit titles, difficulty, tags, and test cases.',
        button: 'Update',
        color: 'btn-sky',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
        )
    },
    {
        title: 'Delete problem',
        description: 'Remove an outdated problem from the platform.',
        button: 'Delete',
        color: 'btn-rose',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        )
    },
];

export default function Admin() {
    const navigate = useNavigate();
    const [selectedAction, setSelectedAction] = useState('');

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
            {/* Ambient background glow */}
            <div aria-hidden className="pointer-events-none absolute -top-48 -left-40 h-[32rem] w-[32rem] rounded-full bg-indigo-500/15 blur-[130px]" />
            <div aria-hidden className="pointer-events-none absolute top-1/3 -right-48 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[130px]" />
            {/* Grid overlay */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)]" />

            {/* Nav */}
            <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-sm font-black text-slate-950 shadow-lg shadow-indigo-500/25">
                            L
                        </span>
                        <span className="text-lg font-semibold tracking-tight text-white">
                            ApexX <span className="font-normal text-slate-400">Admin</span>
                        </span>
                    </Link>

                    <Link to="/" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white">
                        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
                        Back to problems
                    </Link>
                </div>
            </nav>

            <section className="relative mx-auto max-w-5xl px-6 py-16">
                {/* Hero */}
                <header className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_2px] shadow-indigo-400/60" />
                        Admin workspace
                    </span>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Manage your <br />
                        <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
                            platform
                        </span>
                    </h1>

                    <p className="mt-5 text-base leading-relaxed text-slate-400">
                        Create, update, and organize coding problems from one simple, centralized dashboard.
                    </p>
                </header>

                {/* Actions Grid */}
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {actions.map((action) => {
                        // Map custom colors to Tailwind classes
                        const isCreate = action.title === 'Create problem';
                        const isUpdate = action.title === 'Update problem';
                        const isDelete = action.title === 'Delete problem';

                        const borderHover = isCreate ? 'hover:border-indigo-500/30 hover:shadow-indigo-500/10' : isUpdate ? 'hover:border-sky-500/30 hover:shadow-sky-500/10' : 'hover:border-rose-500/30 hover:shadow-rose-500/10';
                        const iconBg = isCreate ? 'border-indigo-400/20 bg-indigo-500/10 text-indigo-400' : isUpdate ? 'border-sky-400/20 bg-sky-500/10 text-sky-400' : 'border-rose-400/20 bg-rose-500/10 text-rose-400';
                        const btnStyle = isCreate ? 'border-0 bg-indigo-500 text-white hover:bg-indigo-400' : isUpdate ? 'border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10' : 'border-0 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300';

                        return (
                            <article key={action.title} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] hover:shadow-2xl ${borderHover}`}>
                                <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 ${isCreate ? 'bg-indigo-500/20' : isUpdate ? 'bg-sky-500/20' : 'bg-rose-500/20'}`} />
                                
                                <div className={`relative mb-5 grid h-11 w-11 place-items-center rounded-xl border shadow-inner ${iconBg}`}>
                                    {action.icon}
                                </div>

                                <h2 className="relative text-lg font-semibold tracking-tight text-white">
                                    {action.title}
                                </h2>
                                <p className="relative mt-2 min-h-12 text-sm leading-relaxed text-slate-400">
                                    {action.description}
                                </p>

                                <div className="relative mt-6">
                                    <button
                                        className={`btn w-full rounded-xl ${btnStyle}`}
                                        onClick={() => {
                                            if (action.title === 'Create problem') {
                                                navigate("/admin/problem/create");
                                            } else if (action.title === 'Update problem') {
                                                navigate("/admin/problem/update");
                                            } else if (action.title === 'Delete problem') {
                                                navigate("/admin/problem/delete");
                                            } else {
                                                setSelectedAction(action.title);
                                            }
                                        }}
                                    >
                                        {action.button} now
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Videos Card */}
                <article className="group relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
                    <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl transition duration-500 group-hover:bg-fuchsia-500/20" />

                    <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-4">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white shadow-inner">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight text-white">
                                    Manage editorial videos
                                </h2>
                                <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-400">
                                    Upload solution videos for problems or remove existing videos.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn w-full rounded-xl border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10 sm:w-auto"
                            onClick={() => navigate("/admin/video")}
                        >
                            Manage videos
                        </button>
                    </div>
                </article>

                {/* Alert */}
                {selectedAction && (
                    <div role="status" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300 backdrop-blur">
                        <span className="flex items-center gap-3">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-xs">✓</span>
                            {selectedAction} selected. Connect this action to your API next.
                        </span>
                        <button
                            className="btn btn-sm btn-ghost rounded-lg text-emerald-300 hover:bg-emerald-500/20"
                            onClick={() => setSelectedAction('')}
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}