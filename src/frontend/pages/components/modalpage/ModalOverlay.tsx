export default function ModalOverlay({ isOpenModal }: { isOpenModal: any }) {
  // console.log("hidden ? ", isOpenModal);
  return <div className={`overlay ${!isOpenModal ? "hidden" : ""}`}></div>;
}
