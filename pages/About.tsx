import React from 'react';
import { ArrowRight, Compass, Database, Globe2, Map, RadioTower, Satellite, Sparkles } from 'lucide-react';
import { Link } from '../utils/router';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { DEFAULT_ABOUT_CONTENT } from '../constants';
import { useSiteSettings } from '../components/Layout';

const principles = [
  {
    number: '01',
    title: 'Dữ liệu có ngữ cảnh',
    description: 'Mỗi lớp bản đồ chỉ có ý nghĩa khi nguồn, thời gian và hệ quy chiếu được giải thích rõ ràng.',
    icon: Database,
    accent: 'sky'
  },
  {
    number: '02',
    title: 'Khoa học dễ tiếp cận',
    description: 'Chuyển thuật ngữ chuyên sâu thành câu chuyện trực quan mà không làm mất độ chính xác.',
    icon: Compass,
    accent: 'violet'
  },
  {
    number: '03',
    title: 'Góc nhìn liên hành tinh',
    description: 'Kết nối bài toán trên Trái Đất với cách con người quan sát và lập bản đồ các thiên thể.',
    icon: Satellite,
    accent: 'amber'
  }
] as const;

const principleAccent = {
  sky: 'bg-sky-100 text-sky-700 dark:bg-cyan-400/10 dark:text-cyan-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
};

const About: React.FC = () => {
  const settings = useSiteSettings();
  const siteName = settings ? `${settings.siteNamePrefix}${settings.siteNameSuffix}`.trim() : 'website';
  const content = settings?.aboutContent || DEFAULT_ABOUT_CONTENT;
  const renderedContent = content.split('{{siteName}}').join(siteName).split('CosmoGIS').join(siteName);

  return (
    <div className="min-h-screen text-slate-800 dark:text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
        <div className="pointer-events-none absolute left-[8%] top-10 hidden h-72 w-72 rounded-full bg-sky-400/15 blur-[100px] dark:block" />
        <div className="pointer-events-none absolute right-[5%] top-1/3 hidden h-80 w-80 rounded-full bg-violet-500/15 blur-[110px] dark:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm backdrop-blur dark:border-cyan-400/25 dark:bg-cyan-400/5 dark:text-cyan-300">
              <Sparkles size={14} /> Câu chuyện của {siteName}
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              Dữ liệu là cách chúng tôi
              <span className="mt-2 block bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-violet-400">đọc một thế giới.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Từ một điểm tọa độ đến toàn bộ bề mặt hành tinh, {siteName} tìm kiếm những cách trực quan và đáng tin cậy để kể câu chuyện của không gian.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/blog" className="group inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-sky-700 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200">
                Khám phá nội dung <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-6 py-3.5 font-bold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-cyan-300/50 dark:hover:text-cyan-300">
                Kết nối với chúng tôi
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]" aria-hidden="true">
            <div className="absolute -inset-4 -rotate-2 rounded-[2.5rem] border border-violet-300/35 bg-gradient-to-br from-sky-200/40 to-violet-200/30 dark:border-violet-300/10 dark:from-cyan-400/5 dark:to-violet-500/5" />
            <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-6 shadow-2xl shadow-sky-900/20 dark:border-white/10 sm:min-h-[500px] sm:p-8">
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(125,211,252,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.25) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"><span>Spatial perspective</span><span>Lat 10.98° N</span></div>
              <div className="absolute left-1/2 top-[48%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 sm:h-80 sm:w-80">
                <div className="absolute inset-8 rounded-full border border-dashed border-violet-300/30" />
                <div className="absolute inset-[4.5rem] rounded-full border border-sky-300/25 sm:inset-24" />
                <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-950 shadow-[0_0_65px_rgba(56,189,248,0.5)] sm:h-40 sm:w-40"><Globe2 className="text-white/85" size={52} strokeWidth={1.25} /></div>
                <span className="absolute left-[8%] top-[25%] h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_18px_#c4b5fd]" />
                <span className="absolute bottom-[11%] right-[20%] h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_16px_#a5f3fc]" />
                <span className="absolute right-[-7px] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-800 shadow-xl"><RadioTower className="text-amber-300" size={18} /></span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-slate-300 backdrop-blur sm:bottom-8 sm:left-8 sm:right-8"><span className="flex items-center gap-2"><Map className="text-cyan-300" size={15} /> Từ lớp dữ liệu</span><ArrowRight className="text-slate-500" size={15} /><span>đến hiểu biết</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/65 px-4 py-20 backdrop-blur dark:border-white/10 dark:bg-slate-900/55 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="about-story-title">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-300">Bản tuyên ngôn</p>
            <h2 id="about-story-title" className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Điều chúng tôi đang xây dựng</h2>
            <div className="mt-6 h-px w-20 bg-gradient-to-r from-sky-500 to-violet-500" />
            <p className="mt-6 text-sm leading-6 text-slate-500 dark:text-slate-400">Nội dung bên cạnh được quản lý trực tiếp từ trang Cài đặt và luôn phản ánh thông tin mới nhất của {siteName}.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/60 sm:p-9 lg:p-12">
            <div className="prose prose-lg max-w-none text-slate-700 prose-headings:font-display prose-headings:tracking-tight prose-headings:text-slate-950 prose-strong:text-slate-950 dark:text-slate-200 dark:prose-headings:text-white dark:prose-strong:text-white [&_.text-space-neon]:!text-sky-600 dark:[&_.text-space-neon]:!text-cyan-300 [&_.text-space-purple]:!text-violet-600 dark:[&_.text-space-purple]:!text-violet-300 [&_h1]:!text-slate-950 dark:[&_h1]:!text-white [&_h2]:!text-slate-950 dark:[&_h2]:!text-white [&_h3]:!text-slate-900 dark:[&_h3]:!text-white [&_h4]:!text-slate-900 dark:[&_h4]:!text-white [&_li]:!text-slate-700 dark:[&_li]:!text-slate-200 [&_p]:!leading-8 [&_p]:!text-slate-700 dark:[&_p]:!text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderedContent) }} />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="principles-title">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Hệ quy chiếu chung</p><h2 id="principles-title" className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">Ba nguyên tắc dẫn đường</h2></div>
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(({ number, title, description, icon: Icon, accent }) => (
              <article key={number} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.045] sm:p-7">
                <span className="absolute right-5 top-4 font-mono text-xs text-slate-300 dark:text-slate-600">{number}</span>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${principleAccent[accent]}`}><Icon size={21} /></span>
                <h3 className="mt-8 font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14 lg:py-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-cyan-300/20" /><div className="absolute -right-6 -top-20 h-56 w-56 rounded-full border border-violet-300/20" />
          <div className="relative max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Cùng lập bản đồ</p><h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Một góc nhìn tốt bắt đầu từ câu hỏi đúng.</h2><p className="mt-4 leading-7 text-slate-300">Nếu bạn đang làm việc với WebGIS, dữ liệu không gian hoặc một câu chuyện khoa học cần trực quan hóa, hãy bắt đầu cuộc trao đổi với {siteName}.</p></div>
          <Link to="/contact" className="group relative mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-white lg:mt-0">Liên hệ ngay <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} /></Link>
        </div>
      </section>
    </div>
  );
};

export default About;
