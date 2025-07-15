import Image from "next/image";

export default function Tuned() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src="/images/tuned.svg" alt="Tuned" width={100} height={100} className="md:max-w-[360px] max-w-[200px] w-full" />
    </div>
  );
}