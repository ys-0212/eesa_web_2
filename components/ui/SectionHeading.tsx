type Props = {
  main: string;
  accent?: string;
  className?: string;
  id?: string;
};

/** Dammit Sans section H2 with an optional hot-pink second line. */
export function SectionHeading({ main, accent, className = '', id }: Props) {
  return (
    <h2
      id={id}
      className={`text-white text-hero-h2-mobile font-bold md:font-medium md:text-hero-h2 mb-[2.178rem] font-dammit-sans text-pretty ${className}`}
    >
      {main}
      {accent ? (
        <>
          {' '}
          <span className="block text-hot-pink">{accent}</span>
        </>
      ) : null}
    </h2>
  );
}
