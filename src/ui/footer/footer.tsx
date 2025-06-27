export default function Footer() {
  return (
    <footer className="flex items-center justify-center w-full h-16 bg-gray-800 text-white">
      <p className="text-sm">
        © {new Date().getFullYear()} VisHeart Frontend. All rights reserved.
      </p>
    </footer>
  );
}
