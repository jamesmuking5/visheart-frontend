export default function Footer() {
  return (
    <footer className="flex absolute bottom-0 items-center justify-center w-full h-16 bg-black text-white">
      <p className="text-sm">
        © {new Date().getFullYear()} VisHeart. All rights reserved.
      </p>
    </footer>
  );
}
