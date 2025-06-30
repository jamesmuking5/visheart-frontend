export default function Footer() {
  return (
    <footer className="flex absolute bottom-0 items-center justify-center w-full h-16 bg-background">
      <p className="text-sm">
        © {new Date().getFullYear()} VisHeart. All rights reserved.
      </p>
    </footer>
  );
}
