import { Tab, Tabs, useTheme } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box/Box";
import PageHeader from "../../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper/Paper";
import InvestDashboard from "./InvestDashboard.tsx";
import InvestAssets from "./assets/InvestAssets.tsx";
import InvestTransactions from "./transactions/InvestTransactions.tsx";
import InvestStats from "./stats/InvestStats.tsx";
import {
  ROUTE_INVEST_ASSETS,
  ROUTE_INVEST_DASHBOARD,
  ROUTE_INVEST_STATS,
  ROUTE_INVEST_TRANSACTIONS,
} from "../../providers/RoutesProvider.tsx";
import { useNavigate } from "react-router-dom";
import { useSpeech } from "../../providers/SpeechProvider.tsx";

export enum InvestTab {
  Summary = 0,
  Assets = 1,
  Transactions = 2,
  Reports = 3,
}

const Invest = ({ defaultTab }: { defaultTab?: InvestTab }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<InvestTab>(defaultTab || 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    switch (selectedTab) {
      case InvestTab.Assets:
        navigate(ROUTE_INVEST_ASSETS);
        break;
      case InvestTab.Transactions:
        navigate(ROUTE_INVEST_TRANSACTIONS);
        break;
      case InvestTab.Reports:
        navigate(ROUTE_INVEST_STATS);
        break;
      case InvestTab.Summary:
      default:
        navigate(ROUTE_INVEST_DASHBOARD);
        break;
    }
  }, [selectedTab]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case InvestTab.Summary:
        return <InvestDashboard />;
      case InvestTab.Assets:
        return <InvestAssets />;
      case InvestTab.Transactions:
        return <InvestTransactions />;
      case InvestTab.Reports:
        return <InvestStats />;
      default:
        return null;
    }
  };

  const { startListening, recognizedText } = useSpeech();

  return (
    <div
      onMouseDown={(ev) => {
        if (ev.button == 1) {
          ev.preventDefault();
          startListening(async () => {
            console.log(recognizedText.current);
            fetch("http://localhost:8000/api/talk", {
              method: "POST", // Specify GET method
              headers: {
                "Content-Type": "application/json", // Optional, for JSON payload
              },
              body: JSON.stringify({ message: recognizedText.current }), // Include a body (not typical for GET)
            }).then(async (res) => {
              // console.log(res);
              // console.log(await res.json());
              let data = await res.json();
              console.log(data);
              let func_name = data.command.substring(4);
              if (data.command.substring(0, 3) == "Nav") {
                navigate("/" + func_name.toLowerCase());
              } else {
                window[func_name]();
              }
              console.log(func_name);
              // console.log(window);
            });
          });
        }
      }}
    >
      <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
        >
          <PageHeader
            title={t("investments.investments")}
            subtitle={t("investments.strapLine")}
          />
        </Box>
        <Grid container spacing={2}>
          {" "}
          <Grid xs={12}>
            <Tabs
              selectionFollowsFocus
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
            >
              <Tab label={t("investments.summary")} />
              <Tab label={t("investments.assets")} />
              <Tab label={t("investments.transactions")} />
              <Tab label={t("investments.reports")} />
            </Tabs>
            <Box mt={4}>{renderTabContent()}</Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default Invest;
