import { useInstantSearch } from "react-instantsearch";

export function NoResultsBoundary({ children, fallback }) {
    const { results } = useInstantSearch();
  
    // The `__isArtificial` flag makes sure not to display the No Results message
    // when no hits have been returned.
    if (!results.__isArtificial && results.nbHits === 0) {
      return (
        <>
          {fallback}
          <div hidden>{children}</div>
        </>
      );
    }
  
    return children;
  }
  
  export function NoResults() {
    const { indexUiState } = useInstantSearch();
  
    return (
      <div>
        <p>
          No results for <q>{indexUiState.query}</q>.
        </p>
      </div>
    );
  }
  