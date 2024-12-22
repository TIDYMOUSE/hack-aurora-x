import { useTranslation } from "react-i18next";
import PageHeader from "../../../components/PageHeader.tsx";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import {
  addLeadingZero,
  formatNumberAsCurrency,
} from "../../../utils/textUtils.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Paper from "@mui/material/Paper/Paper";
import { Box, List, ListItem, useTheme } from "@mui/material";
import Button from "@mui/material/Button/Button";
import { CloudUpload, FileCopy, Lock, LockOpen } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateBudgetStep0,
  useCreateBudgetStep1,
  useGetBudget,
  useGetBudgetToClone,
  useUpdateBudget,
  useUpdateBudgetStatus,
} from "../../../services/budget/budgetHooks.ts";
import { useLoading } from "../../../providers/LoadingProvider.tsx";
import {
  AlertSeverity,
  useSnackbar,
} from "../../../providers/SnackbarProvider.tsx";
import { BudgetCategory } from "../../../services/budget/budgetServices.ts";
import Typography from "@mui/material/Typography/Typography";
import Chip from "@mui/material/Chip/Chip";
import { ROUTE_BUDGET_DETAILS } from "../../../providers/RoutesProvider.tsx";
import { TransactionType } from "../../../services/trx/trxServices.ts";
import TransactionsTableDialog from "../../../components/TransactionsTableDialog.tsx";
import BudgetListSummaryDialog from "./BudgetListSummaryDialog.tsx";
import BudgetCategoryRow from "./BudgetCategoryRow.tsx";
import BudgetSummaryBoard from "./BudgetSummaryBoard.tsx";
import { debounce } from "lodash";
import BudgetDescription from "./BudgetDescription.tsx";
import { useSpeech } from "../../../providers/SpeechProvider.tsx";

const BudgetDetails = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loader = useLoading();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { id } = useParams();
  const [budgetToClone, setBudgetToClone] = useState<bigint | null>(null);
  const getBudgetRequest = useGetBudget(BigInt(id ?? -1));
  const createBudgetStep0Request = useCreateBudgetStep0();
  const createBudgetStep1Request = useCreateBudgetStep1();
  const updateBudgetStatusRequest = useUpdateBudgetStatus();
  const updateBudgetRequest = useUpdateBudget();
  const getBudgetToCloneRequest = useGetBudgetToClone(budgetToClone);
  const [monthYear, setMonthYear] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [isNew, setNew] = useState(true);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const debouncedCategories = useMemo(() => debounce(setCategories, 300), []);
  const [initialBalance, setInitialBalance] = useState(0);
  const [actionableCategory, setActionableCategory] = useState<{
    category: BudgetCategory;
    isDebit: boolean;
  } | null>(null);
  const [isTrxTableDialogOpen, setTrxTableDialogOpen] = useState(false);
  const [isCloneBudgetDialogOpen, setCloneBudgetDialogOpen] = useState(false);
  const orderCategoriesByDebitAmount = (
    categories: BudgetCategory[],
    isOpen: boolean
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_debit != 0 || cat.planned_amount_debit != 0
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.initial_planned_amount_debit + "") -
            Number(a.initial_planned_amount_debit + "")
          );
        return (
          Number(b.current_amount_debit + "") -
          Number(a.current_amount_debit + "")
        );
      });
  };

  const getDescriptionValue = () => {
    return descriptionRef.current?.value ?? "";
  };

  const setDescriptionValue = (text: string) => {
    if (descriptionRef.current != null) {
      descriptionRef.current.value = text;
    }
  };

  const orderCategoriesByCreditAmount = (
    categories: BudgetCategory[],
    isOpen: boolean
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_credit != 0 || cat.planned_amount_credit != 0
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.initial_planned_amount_credit + "") -
            Number(a.initial_planned_amount_credit + "")
          );
        return (
          Number(b.current_amount_credit + "") -
          Number(a.current_amount_credit + "")
        );
      });
  };

  const debitCategories = useMemo(() => {
    return orderCategoriesByDebitAmount(categories, isOpen);
  }, [categories, isOpen]);
  const creditCategories = useMemo(() => {
    return orderCategoriesByCreditAmount(categories, isOpen);
  }, [categories, isOpen]);

  const calculateBudgetBalances = (
    categories?: BudgetCategory[]
  ): {
    plannedBalance: number;
    currentBalance: number;
    plannedIncome: number;
    plannedExpenses: number;
    currentIncome: number;
    currentExpenses: number;
  } => {
    if (!categories)
      return {
        plannedBalance: 0,
        currentBalance: 0,
        plannedIncome: 0,
        plannedExpenses: 0,
        currentIncome: 0,
        currentExpenses: 0,
      };

    return categories.reduce(
      (acc, cur) => {
        return {
          plannedBalance:
            acc.plannedBalance +
            cur.planned_amount_credit -
            cur.planned_amount_debit,
          currentBalance:
            acc.currentBalance +
            cur.current_amount_credit -
            cur.current_amount_debit,
          plannedIncome:
            acc.plannedIncome +
            (cur.exclude_from_budgets ? 0 : cur.planned_amount_credit),
          plannedExpenses:
            acc.plannedExpenses +
            (cur.exclude_from_budgets ? 0 : cur.planned_amount_debit),
          currentIncome:
            acc.currentIncome +
            (cur.exclude_from_budgets ? 0 : cur.current_amount_credit),
          currentExpenses:
            acc.currentExpenses +
            (cur.exclude_from_budgets ? 0 : cur.current_amount_debit),
        };
      },
      {
        plannedBalance: 0,
        currentBalance: 0,
        plannedIncome: 0,
        plannedExpenses: 0,
        currentIncome: 0,
        currentExpenses: 0,
      }
    );
  };

  const calculatedBalances = useMemo(
    () => calculateBudgetBalances(categories),
    [categories]
  );

  // Fetch
  useEffect(() => {
    setNew(!id);
    if (!id) {
      createBudgetStep0Request.refetch();
    } else {
      getBudgetRequest.refetch();
    }
  }, [id]);

  // Loading
  useEffect(() => {
    if (
      getBudgetRequest.isFetching ||
      createBudgetStep0Request.isFetching ||
      updateBudgetStatusRequest.isPending ||
      updateBudgetRequest.isPending ||
      createBudgetStep1Request.isPending ||
      getBudgetToCloneRequest.isFetching
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    getBudgetRequest.isFetching,
    createBudgetStep0Request.isFetching,
    updateBudgetStatusRequest.isPending,
    updateBudgetRequest.isPending,
    createBudgetStep1Request.isPending,
    getBudgetToCloneRequest.isFetching,
  ]);

  // Error
  useEffect(() => {
    if (
      getBudgetRequest.isError ||
      createBudgetStep0Request.isError ||
      updateBudgetStatusRequest.isError ||
      updateBudgetRequest.isError ||
      createBudgetStep1Request.isError ||
      getBudgetToCloneRequest.isError
    ) {
      snackbar.showSnackbar(
        t("common.somethingWentWrongTryAgain"),
        AlertSeverity.ERROR
      );
    }
  }, [
    getBudgetRequest.isError,
    createBudgetStep0Request.isError,
    updateBudgetStatusRequest.isError,
    updateBudgetRequest.isError,
    createBudgetStep1Request.isError,
    getBudgetToCloneRequest.isError,
  ]);

  // Data successfully loaded
  useEffect(() => {
    if (getBudgetRequest.data) {
      // datepicker
      setMonthYear({
        month: getBudgetRequest.data.month,
        year: getBudgetRequest.data.year,
      });
      // observations
      setDescriptionValue(getBudgetRequest.data.observations);

      // open
      setOpen(getBudgetRequest.data.is_open == 1);

      // initial balance
      setInitialBalance(getBudgetRequest.data.initial_balance);

      // categories
      setCategories(getBudgetRequest.data.categories);
    } else if (createBudgetStep0Request.data) {
      // open
      setOpen(true);

      // initial balance
      setInitialBalance(
        parseFloat(createBudgetStep0Request.data.initial_balance) || 0
      );

      // categories
      setCategories(
        createBudgetStep0Request.data.categories.map((category) => ({
          ...category,
          current_amount_credit: 0,
          current_amount_debit: 0,
          planned_amount_credit: 0,
          planned_amount_debit: 0,
        }))
      );
    }
  }, [getBudgetRequest.data, createBudgetStep0Request.data]);

  // Create budget step 1 request success
  useEffect(() => {
    if (createBudgetStep1Request.data) {
      navigate(
        ROUTE_BUDGET_DETAILS.replace(
          ":id",
          createBudgetStep1Request.data.budget_id + ""
        )
      );
    }
  }, [createBudgetStep1Request.data]);

  // Get budget to clone request success
  useEffect(() => {
    if (!getBudgetToCloneRequest.data) return;
    setDescriptionValue(getBudgetToCloneRequest.data.observations);
    setCategories(getBudgetToCloneRequest.data.categories);
  }, [getBudgetToCloneRequest.data]);

  const handleCategoryClick = (category: BudgetCategory, isDebit: boolean) => {
    setActionableCategory({ category, isDebit });
    setTrxTableDialogOpen(true);
  };

  const createBudget = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + "",
        planned_value_debit: plannedDebit + "",
        planned_value_credit: plannedCredit + "",
      };
    });
    createBudgetStep1Request.mutate({
      month: monthYear.month,
      year: monthYear.year,
      observations: getDescriptionValue(),
      cat_values_arr: catValuesArr,
    });
  };

  window.createBudget = createBudget;

  const updateBudget = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + "",
        planned_value_debit: plannedDebit + "",
        planned_value_credit: plannedCredit + "",
      };
    });
    updateBudgetRequest.mutate({
      budget_id: parseFloat(id || "-1"),
      month: monthYear.month,
      year: monthYear.year,
      observations: getDescriptionValue(),
      cat_values_arr: catValuesArr,
    });
  };

  window.updateBudget = updateBudget;

  const handleMonthChange = (newDate: Dayjs | null) => {
    if (newDate == null) return;
    setMonthYear({ month: newDate.month() + 1, year: newDate.year() });
  };

  const handleCloneBudgetClick = () => {
    setCloneBudgetDialogOpen(true);
  };

  const handleCloneBudgetSelected = (budgetId: bigint) => {
    if (budgetId == -1n) return;
    setCloneBudgetDialogOpen(false);
    setBudgetToClone(budgetId);
  };

  if (
    (getBudgetRequest.isLoading || !getBudgetRequest.data) &&
    (createBudgetStep0Request.isFetching || !createBudgetStep0Request.data)
  ) {
    return null;
  }

  function onCategoryPlannedAmountChange(
    category: BudgetCategory,
    isDebit: boolean,
    value: number
  ) {
    debouncedCategories(
      categories.map((c) =>
        c.category_id == category.category_id
          ? {
              ...c,
              planned_amount_debit: isDebit ? value : c.planned_amount_debit,
              planned_amount_credit: isDebit ? c.planned_amount_credit : value,
            }
          : c
      )
    );
  }

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
        {isCloneBudgetDialogOpen && (
          <BudgetListSummaryDialog
            isOpen
            onClose={() => setCloneBudgetDialogOpen(false)}
            onBudgetSelected={handleCloneBudgetSelected}
          />
        )}
        {isTrxTableDialogOpen && (
          <TransactionsTableDialog
            title={t("budgetDetails.transactionsList")}
            categoryId={actionableCategory?.category.category_id || -1n}
            month={monthYear.month}
            year={monthYear.year}
            type={
              actionableCategory?.isDebit
                ? TransactionType.Expense
                : TransactionType.Income
            }
            onClose={() => {
              setTrxTableDialogOpen(false);
              setActionableCategory(null);
            }}
            isOpen
          />
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <PageHeader
            title={t("budgetDetails.budget")}
            subtitle={t("budgetDetails.strapLine")}
          />
          <Button
            size="small"
            variant="contained"
            disabled={!isOpen}
            startIcon={<FileCopy />}
            onClick={handleCloneBudgetClick}
          >
            {t("budgetDetails.cloneAnotherBudget")}
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid xs={12} md={6} lg={3}>
            <DatePicker
              label={t("stats.month")}
              views={["month", "year"]}
              onChange={(newDate) => handleMonthChange(newDate)}
              value={dayjs(
                `${monthYear.year}-${addLeadingZero(monthYear.month)}`
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lgOffset={3}>
            <BudgetDescription ref={descriptionRef} />
          </Grid>
          <Grid xs={12}>
            <BudgetSummaryBoard
              calculatedBalances={calculatedBalances}
              isOpen={isOpen}
              initialBalance={initialBalance}
            />
          </Grid>
          {/* Debit categories */}
          <Grid xs={12} md={6}>
            <Grid container>
              <Grid xs={12} md={6}>
                <Typography variant="h4">{t("common.debit")}</Typography>
              </Grid>
              <Grid xs={12} md={6} xsOffset="auto">
                <Chip
                  label={`${t("budgetDetails.essentialExpenses")}: ${formatNumberAsCurrency(getBudgetRequest?.data?.debit_essential_trx_total || 0)}`}
                  variant="filled"
                  size="medium"
                  color="default"
                />
              </Grid>
            </Grid>
            <List>
              {debitCategories.map((category) => (
                <React.Fragment key={category.category_id}>
                  <ListItem alignItems="flex-start" sx={{ pl: 0, pr: 0 }}>
                    <BudgetCategoryRow
                      category={category}
                      isOpen={isOpen}
                      isDebit={true}
                      month={monthYear.month}
                      year={monthYear.year}
                      onCategoryClick={handleCategoryClick}
                      onInputChange={(amount) =>
                        onCategoryPlannedAmountChange(category, true, amount)
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Grid>
          {/*Credit categories*/}
          <Grid xs={12} md={6}>
            <Typography variant="h4">{t("common.credit")}</Typography>
            <List>
              {creditCategories.map((category) => (
                <React.Fragment key={category.category_id}>
                  <ListItem alignItems="flex-start">
                    <BudgetCategoryRow
                      category={category}
                      isOpen={isOpen}
                      isDebit={false}
                      month={monthYear.month}
                      year={monthYear.year}
                      onCategoryClick={handleCategoryClick}
                      onInputChange={(amount) =>
                        onCategoryPlannedAmountChange(category, false, amount)
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Grid>
          <Grid
            container
            xs={12}
            sx={{
              color: "gray",
              position: "sticky",
              bottom: 0,
              pt: 5,
              pb: 5,
              background: theme.palette.background.paper,
              zIndex: 9,
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                sx={{ margin: 1 }}
                onClick={() => (isNew ? createBudget() : updateBudget())}
              >
                {t(
                  isNew
                    ? "budgetDetails.addBudgetCTA"
                    : "budgetDetails.updateBudget"
                )}
              </Button>
              {!isNew && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isOpen ? <Lock /> : <LockOpen />}
                  onClick={() =>
                    updateBudgetStatusRequest.mutate({
                      budgetId: BigInt(id ?? -1),
                      isOpen: isOpen,
                    })
                  }
                >
                  {t(
                    isOpen
                      ? "budgetDetails.closeBudgetCTA"
                      : "budgetDetails.reopenBudget"
                  )}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default BudgetDetails;
