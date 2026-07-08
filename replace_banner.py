with open('src/pages/AboutPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_banner = 'className="mt-6 relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/4 backdrop-blur-sm overflow-hidden"'
new_banner = 'className="group mt-6 relative rounded-[24px] border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0b0f19]/80 backdrop-blur-2xl overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"'
content = content.replace(old_banner, new_banner)

old_grad = 'className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-emerald-900/20 pointer-events-none"'
new_grad = 'className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-transparent to-emerald-900/20 pointer-events-none opacity-0 dark:opacity-100"'
content = content.replace(old_grad, new_grad)

old_gh_btn = 'className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all duration-200 hover:scale-105"'
new_gh_btn = 'className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"'
content = content.replace(old_gh_btn, new_gh_btn)

old_dc_btn = 'className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500/20 text-sky-200 font-bold text-sm border border-sky-500/30 hover:bg-sky-500/30 transition-all duration-200 hover:scale-105"'
new_dc_btn = 'className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold text-sm border border-sky-200 dark:border-sky-500/30 hover:bg-sky-100 dark:hover:bg-sky-500/30 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"'
content = content.replace(old_dc_btn, new_dc_btn)

with open('src/pages/AboutPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
