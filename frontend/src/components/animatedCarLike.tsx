import { Car } from "lucide-react";

interface Props {
  show: boolean;
  liked: boolean;
  position: { x: number; y: number } | null;
}

export default function AnimatedCarLike({ show, liked, position }: Props) {
  if (!show || !position) return null;

  return (
    <div
      className="absolute pointer-events-none animate-fade-scale"
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -50%)",
        position: "absolute",
      }}
    >
      <Car
        size={80}
        className={`${
          liked ? "stroke-red-600 fill-red-600" : "stroke-white"
        } transition duration-700`}
      />
    </div>
  );
}
