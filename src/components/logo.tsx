import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/images/logo.svg" alt="Logo" width={550} height={100} className="md:max-w-[550px] max-w-[300px] w-full" />
    </div>
  );
}