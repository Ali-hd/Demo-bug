import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs";
import singletonRouter from "next/router";

const routeStateDefaultValues: any = {
  query: "",
  page: "1",
  category: "",
};

const encodedCategories = {
  Cameras: "Cameras & Camcorders",
  Cars: "Car Electronics & GPS",
  Phones: "Cell Phones",
  TV: "TV & Home Theater",
} as const;

type EncodedCategories = typeof encodedCategories;
type DecodedCategories = {
  [K in keyof EncodedCategories as EncodedCategories[K]]: K;
};

const decodedCategories = Object.keys(
  encodedCategories
).reduce<DecodedCategories>((acc, key) => {
  const newKey = encodedCategories[key as keyof EncodedCategories];
  const newValue = key;

  return {
    ...acc,
    [newKey]: newValue,
  };
}, {} as any);

// Returns a slug from the category name.
// Spaces are replaced by "+" to make
// the URL easier to read and other
// characters are encoded.
function getCategorySlug(name: string): string {
  const encodedName =
    decodedCategories[name as keyof DecodedCategories] || name;

  return encodedName.split(" ").map(encodeURIComponent).join("+");
}

// Returns a name from the category slug.
// The "+" are replaced by spaces and other
// characters are decoded.
function getCategoryName(slug: string): string {
  const decodedSlug =
    encodedCategories[slug as keyof EncodedCategories] || slug;

  return decodeURIComponent(decodedSlug.replace(/\+/g, " "));
}

const indexName = "instant_search";

const routing = (url?: string) => ({
  router: createInstantSearchRouterNext({
    serverUrl: url,
    singletonRouter,
    routerOptions: {
      cleanUrlOnDispose: false,
      createURL({ qsModule, routeState, location }): string {
        const urlParts = location.href.match(/^(.*?)\/search/)
        const baseUrl = `${urlParts ? urlParts[1] : ""}/`

        const categoryPath = routeState.category
        ? `/${getCategorySlug(routeState.category)}/`
        : '';

        const queryParameters: Partial<any> = {};
        if (
          routeState.query &&
          routeState.query !== routeStateDefaultValues.query
        ) {
          queryParameters.query = encodeURIComponent(routeState.query as string);
        }
        if (
          routeState.page &&
          routeState.page !== routeStateDefaultValues.page
        ) {
          queryParameters.page = routeState.page;
        }
        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: "repeat",
        });

        if (!urlParts) {
          return location.href
        }

        return `${baseUrl}search${categoryPath}${queryString}${queryString}`
      },
      parseURL({ qsModule, location }): any {
        const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
        const category = getCategoryName(
          (pathnameMatches && pathnameMatches[1]) || ''
        );
        const { query = "", page = 1 } = qsModule.parse(
          location.search.slice(1)
        );

        return {
          query: decodeURIComponent(query as string),
          page: page as string,
          category,
        };
      },
    },
  }),
  stateMapping: {
    stateToRoute(uiState: any) {
      const indexUiState = uiState[indexName];
      return {
        query: indexUiState.query,
        page: (indexUiState.page && String(indexUiState.page)) || undefined,
        category:
          indexUiState.hierarchicalMenu &&
          indexUiState.hierarchicalMenu["hierarchicalCategories.lvl0"] &&
          indexUiState.hierarchicalMenu["hierarchicalCategories.lvl0"].join(
            "/"
          ),
      };
    },
    routeToState(routeState: any) {
      const hierarchicalMenu: { [key: string]: string[] } = {};
      if (routeState.category) {
        hierarchicalMenu["hierarchicalCategories.lvl0"] =
          routeState.category.split("/");
      }
      return {
        [indexName]: {
          query: routeState.query,
          page: Number(routeState.page),
          hierarchicalMenu,
        },
      };
    },
  },
});

export default routing