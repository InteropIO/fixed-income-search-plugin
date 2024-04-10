import { IOConnectBrowser } from "@interopio/browser";
import { IOConnectSearch } from "@interopio/search-api";
import { FIXED_INCOME_WORKSPACE, fixedIncomeInstruments, fixedIncomeOrders } from "./fixed-income-data";

interface Fdc3Instrument {
  type: "fdc3.instrument";
  name?: string;
  id?: Fdc3InstrumentId;
}

interface FixedIncomeOrder {
  type: "fixedIncome.order";
  id: string;
  clientId: string;
  ticker: string;
}

export interface Fdc3InstrumentId {
  ticker?: string;
  BBG?: string;
  BBG_EXCHANGE?: string;
  CUSIP?: string;
  FDS_ID?: string;
  FIGI?: string;
  ISIN?: string;
  PERMID?: string;
  RIC?: string;
  SEDOL?: string;
  [key: string]: unknown;
}

const UPDATE_WORKSPACE_CONTEXT_METHOD = "FIUpdateSelectedWorkspaceContext";
const RESTORE_FI_WORKSPACE_WITH_CONTEXT_METHODNAME = "FIRestoreWorkspaceWithContext";
const RESTORE_WORKSPACE_SEARCH_SECTION = "Restore Workspace";

const activeWorkspaceSyncDefinition = {
  name: UPDATE_WORKSPACE_CONTEXT_METHOD,
  accepts: "Fdc3Instrument",
  returns: "",
  displayName: "Write data to active workspace context",
  description:
    "Writes the passed in context object to the currently selected workspace context",
};

const restoreWorkspaceWithContextDefinition = {
  name: RESTORE_FI_WORKSPACE_WITH_CONTEXT_METHODNAME,
  accepts: "string workspaceName, Fdc3Instrument context ", //TODO: Revisit
  returns: "",
  displayName: "Restore workspace with passed context",
  description: "Restore the passed workspace with the passed in context object",
};

const activeWorkspaceSyncHandler = async (
  context: Fdc3Instrument | FixedIncomeOrder,
  io: IOConnectBrowser.API
) => {
  try {
    const activeWorkspace = await getSelectedWorkspace(io);

    if (!activeWorkspace) {
      return;
    }

    switch (context.type) {
      case "fdc3.instrument":
        activeWorkspace.setContext({
          searchSync: {
            instrument: {
              ...context,
              id: {
                ...context.id,
              },
            },
          },
        });
        break;
      case "fixedIncome.order":
        activeWorkspace.setContext({
          searchSync: {
            fixedIncomeOrder: context
          },
        });
        break;
    }
  } catch (e) {
    console.error("(SearchPlugin) Error writing to workspace context", e);
  }
};

const restoreWorkspaceWithContextHandler = async (
  {
    workspaceName,
    context,
  }: {
    workspaceName: string;
    context: Fdc3Instrument | FixedIncomeOrder;
  },
  io: IOConnectBrowser.API
) => {
  const layoutSummaries = await io.workspaces?.layouts.getSummaries();

  if (layoutSummaries?.findIndex((x: any) => x.name === workspaceName) !== -1) {

    await io.workspaces
      ?.restoreWorkspace(workspaceName, {
        context: {
          searchSync: { ...context },
          ...context,
        },
      })
      .catch(() => {});
  }
};

async function getSelectedWorkspace(io: IOConnectBrowser.API) {
  const allWorkspaces = await io.workspaces?.getAllWorkspaces();
  return allWorkspaces?.find((ws) => ws.isSelected === true);
}

export const SEARCH_PLUGIN_NAME = "fixed-income-search-plugin";

export const fixedIncomeSearchPluginFactory = async (io: IOConnectBrowser.API) => {
  const logger = io.logger.subLogger(SEARCH_PLUGIN_NAME);

  logger.info(`initializing`);

  if (io.search == null) {
    logger.warn(
      "IO Connect Search API is not initialized. Cannot register search provider."
    );
    return;
  }

  const searchProvider = await io.search.registerProvider({
    name: "fixed-income-search-provider",
  });

  await io.interop.register(activeWorkspaceSyncDefinition, (args) =>
    activeWorkspaceSyncHandler(args, io)
  );

  await io.interop.register(restoreWorkspaceWithContextDefinition, (args) =>
    restoreWorkspaceWithContextHandler(args, io)
  );

  const activeQueriesSet = new Set();

  const sendBackResults = (
    query: IOConnectSearch.ProviderQuery,
    results: IOConnectSearch.QueryResult[]
  ) => {
    for (const result of results) {
      try {
        query.sendResult(result);
      } catch (error) {
        console.error("Error trying to send result back to client: ", error);
      }
    }
    query.done();
  };

  searchProvider.onQuery(async (query: IOConnectSearch.ProviderQuery) => {
    const queryId = query.id;
    activeQueriesSet.add(queryId);

    try {
      const results = await searchRemoteLists(query.search);

      if (!activeQueriesSet.has(queryId)) {
        return;
      }

      activeQueriesSet.delete(queryId);
      if (!results) return;
      sendBackResults(query, results);
    } catch (error: any) {
      if (!activeQueriesSet.has(queryId)) {
        return;
      }

      const errorMessage =
        typeof error === "string"
          ? error
          : typeof error.message === "string"
          ? error.message
          : "Cannot send the query to the data source.";

      activeQueriesSet.delete(queryId);
      query.error(errorMessage);
    }
  });
};

function tokenizeSearchQuery(query: string) {
  var tokens = query
    .toLowerCase()
    .split(" ")
    .filter((token) => {
      return token.trim() !== "";
    });

  var searchRegex = new RegExp(tokens.join("|"), "gim");
  return searchRegex;
}

async function searchRemoteLists(
  searchQuery: string,
) {
  let matches: IOConnectSearch.QueryResult[] = [];
  // Might be fetched from an api at a later point in the future
  const instruments = fixedIncomeInstruments
  const orders = fixedIncomeOrders

  const searchRegex = tokenizeSearchQuery(searchQuery);

  if (instruments) {
    tokenizedSearch(instruments, matches, searchRegex, "Instrument");
  }

  if (orders) {
    tokenizedSearch(orders, matches, searchRegex, "Order");
  }

  return new Promise<IOConnectSearch.QueryResult[] | undefined>(
    (resolve, reject) => {
      if (undefined) reject("Query returned no results");
      else resolve(matches);
    }
  );
}

function shouldTokenize(value: any) {
  const supportedTypes = ["string", "number"];

  return supportedTypes.includes(typeof value);
}

function buildSearchToken(element: any, depth: number, currentDepth: number) {
  let result = "";

  for (const prop in element) {
    const value = element[prop];

    if (value) {
      if (shouldTokenize(value)) {
        result += value.toString().toLowerCase().trim() + " ";
      }

      if (currentDepth < depth) {
        if (typeof value === "object") {
          const nestedSearchToken = buildSearchToken(
            value,
            depth,
            currentDepth + 1
          );
          result += nestedSearchToken;
        }
      }
    }
  }

  return result;
}

function tokenizedSearch(
  inputArr: Array<any>,
  outputArr: Array<IOConnectSearch.QueryResult>,
  searchRegex: RegExp,
  searchType: string,
  depth = 0
) {
  inputArr?.forEach((element) => {
    const initialDepth = 0;
    const searchToken = buildSearchToken(element, depth, initialDepth);


    if (searchToken.match(searchRegex)) {
      switch (searchType) {
        case "Instrument": {
          outputArr.push({
            type: { name: searchType },
            id: element.ticker,
            displayName: element?.description
              ? element.description
              : element.ticker,
            action: {
              method: UPDATE_WORKSPACE_CONTEXT_METHOD,
              params: {
                type: "fdc3.instrument",
                name: element.description,
                id: {
                  RIC: element.ticker + " " + element.bbgExchange,
                  ticker: element.ticker,
                  bbgExchange: element.bbgExchange,
                  isin: element.isin
                },
              },
            },
          });

            outputArr.push({
              type: { name: RESTORE_WORKSPACE_SEARCH_SECTION },
              id: `${element.ticker} restore Workspace with ${FIXED_INCOME_WORKSPACE}`,
              displayName: `'${FIXED_INCOME_WORKSPACE}' Workspace with ${
                element?.description || element?.ticker
              }`,
              action: {
                method: RESTORE_FI_WORKSPACE_WITH_CONTEXT_METHODNAME,
                params: {
                  workspaceName: FIXED_INCOME_WORKSPACE,
                  context: {
                    searchSync: {
                      instrument: {
                        type: "fdc3.instrument",
                        name: element.description,
                        id: {
                          RIC: element.ticker + " " + element.bbgExchange,
                          ticker: element.ticker,
                          bbgExchange: element.bbgExchange,
                          isin: element.isin
                        },
                      },
                    },
                  },
                },
              },
            });
    

          break;
        }

        case "Order": {
          outputArr.push({
            type: { name: searchType },
            id: element.OrderId,
            displayName: `'${FIXED_INCOME_WORKSPACE}' order with ID - ${
                element.OrderId
              }` ,
            action: {
              method: UPDATE_WORKSPACE_CONTEXT_METHOD,
              params: {
                type: "fixedIncome.order",
                name: element.OrderId,
                id: {
                  OrderID: element.OrderId
                },
              },
            },
          });

         outputArr.push({
              type: { name: RESTORE_WORKSPACE_SEARCH_SECTION },
              id: `${element.OrderId} restore Workspace with ${FIXED_INCOME_WORKSPACE}`,
              displayName: `'${FIXED_INCOME_WORKSPACE}' Workspace with Order ID ${
                element.OrderId
              }`,
              action: {
                method: RESTORE_FI_WORKSPACE_WITH_CONTEXT_METHODNAME,
                params: {
                  workspaceName: FIXED_INCOME_WORKSPACE,
                  context: {
                    searchSync: {
                      fixedIncomeOrder: {
                        name: element.OrderId,
                        id: {
                          OrderID: element.OrderId
                        },
                      }
                    },
                  },
                },
              },
            });

          break;
        }
      }
    }
  });
}
