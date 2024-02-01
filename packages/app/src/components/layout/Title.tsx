export const Title = ({ title }: { title: string }) => {
  return (
    <div>
      <h1
        className="
          text-2xl
          font-semibold
          leading-[28.8px]
          text-dark-blue-600
        "
      >
        {title}
      </h1>
    </div>
  );
}

export default Title;
