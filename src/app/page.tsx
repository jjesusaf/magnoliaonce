import CommingSoon from "@/components/comming-soon";
import Logo from "@/components/logo";
import Tuned from "@/components/tuned";
import Art from "@/components/art";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <div className="bg-[#F4F0EB] h-dvh flex flex-col items-center md:justify-between justify-evenly  p-6">
      <div className="">
        <CommingSoon />
        <Tuned />
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <Logo />
        <Art />
      </div>
      <div className="flex items-center justify-center gap-6">
        <Contact />
      </div>
    </div>
  );
}
