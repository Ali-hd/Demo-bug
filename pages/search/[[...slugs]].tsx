import algoliasearch from "algoliasearch/lite";
import { Hit as AlgoliaHit } from "instantsearch.js";
import { GetServerSideProps } from "next";

import React from "react";
import { renderToString } from "react-dom/server";
import {
  InstantSearch,
  Hits,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  getServerState,
  HierarchicalMenu,
  useHits,
  Pagination,
} from "react-instantsearch";

import CustomImage from "../../components/CustomImage";
import {
  NoResults,
  NoResultsBoundary,
} from "../../components/NoResultsBoundary";
import routing from "../../utils/routing";
import Link from "next/link";

const indexName = "instant_search";
const searchClient = algoliasearch(
  "latency",
  "6be0576ff61c053d5f9a3225e2a90f76"
);
type HitType = AlgoliaHit<{
  image: string;
  name: string;
  categories: string[];
  description: string;
  price: number;
  rating: string;
}>;

function Hit({ hit }: { hit: HitType }) {
  return (
    <div className="rounded-lg w-full h-full">
      <div className="relative w-full h-auto rounded aspect-square">
        <CustomImage alt={hit.name} src={hit.image} fill />
      </div>
      <span className="Hit-price">${hit.price}</span>
    </div>
  );
}

type SearchPageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

function Stats() {
  /* causing view hits events to duplicate */
  const { results } = useHits();
  return <h6 className="font-bold text-lg">{`Results ${results?.nbHits}`}</h6>;
}

export default function SearchPage({ serverState, url }: SearchPageProps) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        future={{ preserveSharedStateOnUnmount: true }}
        insights={{
          onEvent: (event, aa) => {
            const { insightsMethod, payload } = event;
            if (insightsMethod) {
              console.log(insightsMethod); // view event duplicating
            }
          },
        }}
        routing={routing(url)}
      >
        <header className="bg-orange-400">
          <Link className="text-xl font-bold cursor-pointer px-2" href="/">
            Visit Home Page
          </Link>
        </header>
        <div className="Container">
          <div>
            <HierarchicalMenu
              attributes={[
                "hierarchicalCategories.lvl0",
                "hierarchicalCategories.lvl1",
              ]}
            />
          </div>
          <div>
            <SearchBox />
            <Stats />
            <NoResultsBoundary fallback={<NoResults />}>
              <Hits hitComponent={Hit} />
            </NoResultsBoundary>
          </div>
          <Pagination />
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

export const getServerSideProps: GetServerSideProps<SearchPageProps> =
  async function getServerSideProps({ req }) {
    const protocol = req.headers.referer?.split("://")[0] || "https";
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const serverState = await getServerState(<SearchPage url={url} />, {
      renderToString,
    });

    return {
      props: {
        serverState,
        url,
      },
    };
  };
