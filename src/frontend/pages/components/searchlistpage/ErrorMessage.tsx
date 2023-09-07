export default function ErrorMessage({
  message1,
  message2,
  query,
}: {
  message1: string;
  message2: string;
  query: string;
}) {
  console.log("errmessga called");
  return (
    <>
      {query ? (
        <p className="error">
          <span className="error-make">🤔</span>
          <div className="error-message">
            {message2}
            <div className="error-query">
              {query.length > 14 ? query.substr(0, 14) : query}
            </div>
          </div>
        </p>
      ) : (
        <p className="error">
          <span className="error-alert">📛</span>
          <div className="error-message">{message1}</div>
        </p>
      )}
    </>
  );
}
