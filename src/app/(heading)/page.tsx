import Content from "./_sections/Content";
import Hero from "./_sections/Hero";

export default function Home() {
  return (
    <div className="max-w-container">
      <div className="h-full w-full flex flex-col gap-4">
        <Hero />
        <Content />
      </div>
    </div>
  );
}
