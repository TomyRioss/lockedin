import ClockWidget from "./clock-widget";
import Nav from "./nav";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-black">
      <Nav />
      <div className="flex flex-col flex-1 items-center justify-center">
        <ClockWidget />
      </div>
    </div>
  );
}
