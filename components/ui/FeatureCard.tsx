/* eslint-disable @next/next/no-img-element */

type Props = { title: string; html: string; image: string; alt: string; className?: string };

/** Image framed by a 2px pink→lime gradient border, then title + rich description. */
export function FeatureCard({ title, html, image, alt, className = '' }: Props) {
  return (
    <div className={`rounded-[0.75rem] relative group flex flex-col ${className}`}>
      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-center">
          <div className="bg-gradient-to-r from-[#FD44B0] to-[#C2EF4E] p-[0.125rem] rounded-[0.75rem]">
            <div className="rounded-[0.6625rem] aspect-[3/1] relative w-full h-auto overflow-hidden bg-[#1F1633]">
              <img src={image} alt={alt} loading="lazy" decoding="async" width={800} height={267} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 pt-6 text-white">
          <h3 className="font-medium text-2xl leading-[1.25] mb-1 text-balance">{title}</h3>
          <div className="feature-description font-normal text-base leading-[1.5] text-white text-pretty">
            <p dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
