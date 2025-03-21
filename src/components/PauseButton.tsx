import { useContext } from "react";
import { SizeContext } from "../contexts/SizeContext";
import { UserContext } from "../contexts/UserContext";

const PauseButton = () => {
  const { user } = useContext(UserContext);
  const { pause } = useContext(SizeContext);

  return user?.pauser ? (
    <button
      className="pause-button"
      onClick={() => {
        pause();
      }}
    >
      PAUSE
    </button>
  ) : null;
};

export default PauseButton;
