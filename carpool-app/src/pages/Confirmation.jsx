import Confetti from 'react-confetti';

function Confirmation() {
  return (
    <div className="confirmation">
      <Confetti />
      <h2>All Set!</h2>
      <p>Ride scheduled for Friday, Jan 26 at 5:30pm</p>
      <p>Cost: $12</p>
    </div>
  );
}

export default Confirmation;