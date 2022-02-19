import { Colors, Text, Toast, Toaster } from "@blueprintjs/core";
import * as React from "react";

const CREATE_ISSUE_URL = "https://github.com/nilaymaj/esolang-park/issues/new";

const styles = {
  errorTitle: {
    fontWeight: "bold",
    whiteSpace: "pre-wrap" as const,
  },
  callStack: {
    padding: 10,
    maxHeight: 300,
    overflowY: "auto" as const,
    borderRadius: 10,
    background: Colors.RED1,
    whiteSpace: "pre-wrap" as const,
    border: "1px solid " + Colors.RED4,
  },
};

const ErrorBoundaryContext = React.createContext<{
  throwError: (error: Error) => void;
}>({ throwError: () => {} });

/** Context provider for error handling */
export const ErrorBoundaryProvider = (props: { children: React.ReactNode }) => {
  const [error, setError] = React.useState<Error | null>(null);

  return (
    <ErrorBoundaryContext.Provider value={{ throwError: setError }}>
      <Toaster>
        {error && (
          <Toast
            icon="error"
            intent="danger"
            timeout={0}
            onDismiss={() => setError(null)}
            message={
              <Text>
                <p>An unexpected error occurred:</p>
                <pre style={styles.errorTitle}>{error.message}</pre>
                <pre style={styles.callStack}>{error.stack}</pre>
                <p>
                  Please{" "}
                  <a href={CREATE_ISSUE_URL} target="_blank">
                    create an issue on GitHub
                  </a>{" "}
                  with:
                </p>
                <ul>
                  <li>The language you were using</li>
                  <li>The code you tried to run</li>
                  <li>The error details and call stack above</li>
                </ul>
                <p>
                  Once done, refresh the page to reload the IDE. If needed,{" "}
                  <b>copy your code before refreshing the page</b>.
                </p>
              </Text>
            }
          />
        )}
      </Toaster>
      {props.children}
    </ErrorBoundaryContext.Provider>
  );
};

/** Utility hook to access error boundary */
export const useErrorBoundary = () => React.useContext(ErrorBoundaryContext);
