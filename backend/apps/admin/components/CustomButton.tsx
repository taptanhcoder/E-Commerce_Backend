import { cn } from "@/lib/utils"; 

const CustomButton = ({
  disabled,
  isRounded,
}: {
  disabled: boolean;
  isRounded: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "text-sm p-4",
        disabled ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600",
        isRounded && "rounded-full" 
      )}
    >
      Hello
    </button>
  );
};

export default CustomButton;
