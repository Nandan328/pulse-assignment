export default function Loading({ show, status, message, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-300 border-t-neutral-900 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Scraping reviews...</h3>
            <p className="text-neutral-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Scraping completed
            </h3>
            <p className="text-neutral-600 mb-4">{message}</p>
            <Button close={onClose} />
          </>
        )}

        {status === "error" && (
          <>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Scraping failed
            </h3>
            <p className="text-neutral-600 mb-4">{message}</p>
            <Button close={onClose} />
          </>
        )}
      </div>
    </div>
  );
}

function Button({ close }) {
  return (
    <>
      <button
        onClick={close}
        className="px-4 py-2 bg-neutral-900 text-white rounded-md cursor-pointer"
      >
        Close
      </button>
    </>
  );
}
