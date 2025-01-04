import React, { useState, useEffect, useMemo, useCallback } from "react";
// @ts-ignore
import Calendar from "react-calendar";
import _ from "lodash";
import clsx from "clsx";
import { PieChart } from "react-minimal-pie-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FinanceLog,
  Span,
  User,
  MISC_TAG,
} from "../../../../defaults";
import {
  mkk,
  colorForKey,
  formatCost,
  subtractSpan,
  getTransactionsWithinDates,
} from "../../../../helpers";
import { generateReactCalendarStyle, makeStyles, theme } from "../../theme";
import ClipLoader from "react-spinners/ClipLoader";

interface SpendingProps {
  userInfo: User;
}

interface PieEntry {
  title: string;
  value: number;
  color: string;
}

interface HistogramEntry {
  range: string;
  total: number;
}

const Spending: React.FC<SpendingProps> = ({ userInfo }) => {
  const allTags = useMemo(() => userInfo.tags.concat(MISC_TAG), [userInfo.tags]);
  const classes = useStyles();

  const [finance, setFinance] = useState<FinanceLog>({});
  const [chartStart, setChartStart] = useState(
    new Date().toLocaleDateString()
  );
  const [chartEnd, setChartEnd] = useState(
    new Date().toLocaleDateString()
  );
  const [chartDateField, setChartDateField] = useState<"start" | "end">(
    "start"
  );
  const [tempChartDate, setTempChartDate] = useState(
    new Date().toLocaleDateString()
  );
  const [selectingChart, setSelectingChart] = useState(false);
  const [hoverKey, setHoverKey] = useState("");
  const [defaultHoverKey, _setDefaultHoverKey] = useState("");
  const [graphFrequencyGap, setGraphFrequencyGap] = useState(1);
  const [graphFrequency, setGraphFrequency] = useState<Span>(Span.MONTH);
  const [graphIndices, setGraphIndices] = useState(10);
  const [graphTags, setGraphTags] = useState(_.cloneDeep(allTags));
  const [selectingGraph, setSelectingGraph] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Spending";
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const allYears: string[] = await (await fetch("/api/all_years")).json();
      const newData = await Promise.all(allYears.map(async year => {
        const newFinanceEntry = await (
          await fetch(`/api/finance?year=${year}`)
        ).json();
        return newFinanceEntry;
      }));
      setFinance(
        newData.reduce(
          (curFinance, newFinanceEntry) => ({...curFinance, ...newFinanceEntry}),
          {},
        )
      );
      setLoading(false);
    })();
  }, []);

  const addGraphTag = (tag: string) => {
    setGraphTags(graphTags.concat(tag));
  };

  const removeGraphTag = (tag: string) => {
    setGraphTags(graphTags.filter(t => t !== tag));
  };

  const selectAllGraphTags = () => {
    setGraphTags(_.cloneDeep(allTags));
  };

  const deselectAllGraphTags = () => {
    setGraphTags([]);
  };

  const setPresetSpan = (span: Span) => {
    const today = new Date();
    const prev = subtractSpan(today, span);
    prev.setDate(prev.getDate() + 1);
    setChartStart(prev.toLocaleDateString());
    setChartEnd(today.toLocaleDateString());
  };

  const setDefaultHoverKey = (key: string) => {
    _setDefaultHoverKey(defaultHoverKey === key ? "" : key);
  };

  const getSpendingByCategory = useCallback(() => {
    const startDate = new Date(chartStart);
    const endDate = new Date(chartEnd);

    const { total, itemized, transactionList } = getTransactionsWithinDates(finance, userInfo.subscriptions, startDate, endDate);

    const pieData: PieEntry[] = Object.entries(itemized).map(
      ([key, value]) => ({
        title: key,
        value,
        color: colorForKey(key),
      })
    );
    return { total, transactionList, pieData };
  }, [chartStart, chartEnd, userInfo.subscriptions, finance]);

  const getHistoricalSpending = useCallback(() => {
    const graphData: HistogramEntry[] = [];
    let curDate = new Date();
    for (let i = 0; i < graphIndices; i++) {
      let prevDate = curDate;
      for (let j = 0; j < graphFrequencyGap; j++) {
        prevDate = subtractSpan(prevDate, graphFrequency);
      }
      const calcPrevDate = new Date(prevDate);
      calcPrevDate.setDate(calcPrevDate.getDate() + 1);
      const { itemized } = getTransactionsWithinDates(finance, userInfo.subscriptions, calcPrevDate, curDate);
      const total = _.sum(graphTags.map(tag => _.get(itemized, tag, 0)));
      graphData.unshift({
        range: `${calcPrevDate.toLocaleDateString()} - ${curDate.toLocaleDateString()}`,
        total,
      });
      curDate = prevDate;
    }
    return { graphData };
  }, [userInfo.subscriptions, finance, graphFrequency, graphFrequencyGap, graphIndices, graphTags]);

  const selectChartDate = (fieldName: "start" | "end") => {
    const relevantDate = fieldName === "start" ? chartStart : chartEnd;
    setChartDateField(fieldName);
    setTempChartDate(relevantDate);
    setSelectingChart(true);
  };

  const commitChartDate = () => {
    setSelectingChart(false);
    if (chartDateField === "start") {
      setChartStart(tempChartDate);
    } else {
      setChartEnd(tempChartDate);
    }
  };

  const curKey = useMemo(
    () => hoverKey || defaultHoverKey,
    [hoverKey, defaultHoverKey]
  );
  const { total, pieData, transactionList } = useMemo(getSpendingByCategory, [
    getSpendingByCategory,
  ]);

  const curTransactions = useMemo(
    () => transactionList[curKey] || [],
    [transactionList, curKey]
  );

  const { graphData } = useMemo(getHistoricalSpending, [
    getHistoricalSpending,
  ]);

  return (
    <div className={classes.spendingContainer}>
      {!selectingChart ? null : (
        <div className={classes.selectContainer} onClick={commitChartDate}>
          <div
            className={classes.selectPopup}
            onClick={(e) => e.stopPropagation()}
          >
            Selecting {chartDateField} date as {tempChartDate}
            <div>
              <Calendar
                className={classes.calendar}
                onClickDay={(e: any) =>
                  setTempChartDate(e.toLocaleDateString())
                }
                calendarType="US"
                defaultValue={new Date(tempChartDate)}
              />
              <style>
                {generateReactCalendarStyle()}
              </style>
            </div>
            <div className={classes.button} onClick={commitChartDate}>
              Select Date
            </div>
          </div>
        </div>
      )}
      <div className={classes.chartContainer}>
        <div className={classes.chartHeader}>
          <div
            className={classes.chartDate}
            onClick={() => selectChartDate("start")}
          >
            {chartStart}
          </div>
          TO
          <div
            className={classes.chartDate}
            onClick={() => selectChartDate("end")}
          >
            {chartEnd}
          </div>
          <div className={classes.chartPresetList}>
            {_.values(Span).map((span) => (
              <div
                className={classes.chartPreset}
                onClick={() => setPresetSpan(span)}
              >
                {span === Span.DAY ? "today" : `this ${span}`}
              </div>
            ))}
          </div>
        </div>
        { loading ? (
          <div className={clsx(classes.chartBody, classes.loader)}>
            <ClipLoader
              color={theme.colors.periwinkle100}
              loading={loading}
            />
          </div>
        ) : (
          <div className={classes.chartBody}>
            <div className={classes.chartPie}>
              <PieChart
                data={pieData}
                onClick={(_, index) => setDefaultHoverKey(pieData[index].title)}
                onMouseOver={(_, index) => setHoverKey(pieData[index].title)}
                onMouseOut={() => setHoverKey("")}
              />
            </div>
            <div className={classes.chartTotals}>
              <div className={classes.chartTotalMain}>
                TOTAL: {formatCost(total)}
              </div>
              <div className={classes.chartDetails}>
                <div>
                  {pieData.map((el) => (
                    <div
                      key={mkk([el.title, el.value])}
                      className={clsx({
                        [classes.chartHoverKey]: el.title === curKey,
                      })}
                    >
                      {el.title} : {formatCost(el.value)}
                    </div>
                  ))}
                </div>
                <div className={classes.chartTransactions}>
                  {curTransactions.map((transaction, ind) => (
                    <div
                      key={mkk([ind, transaction])}
                    >
                      {transaction.date} - {transaction.location}:{" "}
                      {formatCost(transaction.cost)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={classes.graphContainer}>
        <div className={classes.graphHeader}>
          {selectingGraph ? (
            <div className={classes.inputContainer}>
              <input
                type="number"
                name="graphFrequencyGap"
                id="graphFrequencyGap"
                value={graphFrequencyGap}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) {
                    setGraphFrequencyGap(val);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <select
                name="graphFrequency"
                id="graphFrequency"
                value={graphFrequency}
                onChange={(e) =>
                  setGraphFrequency(e.target.value as Span)
                }
              >
                {_.values(Span).map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="graphIndices"
                id="graphIndices"
                value={graphIndices}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 1) {
                    setGraphIndices(val);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <span>
              Spending for past {graphFrequencyGap} {graphFrequency}(s) ({graphIndices} indices)
            </span>
          )}
          <img
            className={clsx(classes.smallButton, "picture")}
            onClick={() => setSelectingGraph(!selectingGraph)}
            src={selectingGraph ? "/media/check.svg" : "/media/pencil.svg"}
          />
        </div>
        <div className={classes.graphBody}>
          <div className={classes.graphTags}>
            {allTags.map((tag, ind) => (
              <label key={ind}>
                <input
                  type="checkbox"
                  checked={graphTags.includes(tag)}
                  onChange={() => { graphTags.includes(tag) ? removeGraphTag(tag) : addGraphTag(tag); }}
                />
                {tag}
              </label>
            ))}
          </div>
          <div className={classes.graphTags}>
            <div className={clsx(classes.smallButton, "text")} onClick={selectAllGraphTags}>ALL</div>
            <div className={clsx(classes.smallButton, "text")} onClick={deselectAllGraphTags}>NONE</div>
          </div>
          { loading ? (
            <div className={classes.loader}>
              <ClipLoader
                color={theme.colors.periwinkle100}
                loading={loading}
              />
            </div>
          ) : (
            <ResponsiveContainer className={classes.histogramContainer} width="100%" height={400}>
              <BarChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis tickFormatter={formatCost} />
                <Tooltip formatter={formatCost} />
                <Bar dataKey="total" fill={theme.colors.periwinkle100} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  selectContainer: {
    position: "fixed",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: "auto",
    zIndex: 150,
  },
  calendar: {
    width: "70vw",
    height: "30vh",
    margin: "20px 0",
  },
  selectPopup: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "10%",
    bottom: "10%",
    margin: "auto",
    backgroundColor: "whitesmoke",
    border: "1px solid #383838",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.1em",
    fontSize: "2vh",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.55em 1.5em 0.6em",
    borderRadius: "100vw",
    textDecorationLine: "none",
    border: `0.08em solid ${theme.colors.black}`,
    textAlign: "center",
    wordWrap: "break-word",
    transition: "transform 1s ease, box-shadow 1s ease",
    "&:hover": {
      transform: "scale(1.05, 1.05)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.19)",
    },
    "&.disabled:hover": {
      transform: "none",
      boxShadow: "none",
      cursor: "default",
    },
  },
  smallButton: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&.text": {
      fontSize: "20px",
      fontWeight: "bold",
    },
    "&.red": {
      color: theme.colors.red,
    },
    "&.green": {
      color: theme.colors.green,
    },
    "&.picture": {
      width: "30px",
    },
    "&:hover": {
      opacity: "0.8",
    },
  },
  spendingContainer: {
    display: "flex",
    paddingTop: "8vh",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing(3),
  },
  chartDate: {
    textDecoration: "underline",
    margin: "0 5px",
    cursor: "pointer",
  },
  chartContainer: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "50%",
  },
  chartHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottom: "1px solid black",
    padding: "10px",
  },
  chartBody: {
    display: "flex",
    flexDirection: "row",
    padding: theme.spacing(1),
    height: "50vh",
  },
  chartPie: {
    width: "50%",
  },
  chartTotals: {
    width: "50%",
    padding: "5px",
    display: "flex",
    flexDirection: "column",
  },
  chartTotalMain: {
    marginBottom: "30px",
    fontSize: "30px",
  },
  chartDetails: {
    height: "70%",
    display: "flex",
    flexDirection: "row",
  },
  chartHoverKey: {
    color: theme.colors.green,
  },
  chartPresetList: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(0.5),
  },
  chartPreset: {
    cursor: "pointer",
    border: "1px solid black",
    borderRadius: "5px",
    padding: theme.spacing(0.5),
  },
  chartTransactions: {
    paddingLeft: "10px",
    overflowY: "scroll",
  },
  graphContainer: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(3),
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "50%",
  },
  graphHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    borderBottom: "1px solid black",
    padding: "10px",
  },
  inputContainer: {
    display: "flex",
    gap: theme.spacing(1),
  },
  graphBody: {
    display: "flex",
    flexDirection: "column",
  },
  graphTags: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  histogramContainer: {
    padding: theme.spacing(1),
  },
  loader: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    margin: `${theme.spacing(1)}px 0`
  },
}));

export default Spending;