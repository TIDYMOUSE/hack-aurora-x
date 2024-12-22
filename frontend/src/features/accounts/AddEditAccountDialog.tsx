import {
  Account,
  AccountStatus,
  AccountType,
} from "../../services/auth/authServices.ts";
import { Trans, useTranslation } from "react-i18next";
import { useLoading } from "../../providers/LoadingProvider.tsx";
import {
  AlertSeverity,
  useSnackbar,
} from "../../providers/SnackbarProvider.tsx";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useEffect, useState } from "react";
import {
  Checkbox,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  AcUnit,
  Description,
  PlayArrow,
  RemoveCircle,
  RemoveCircleOutline,
  Send,
  Undo,
} from "@mui/icons-material";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import { cssGradients } from "../../utils/gradientUtils.ts";
import { ColorGradient } from "../../consts";
import TextField from "@mui/material/TextField/TextField";
import Stack from "@mui/material/Stack/Stack";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import Button from "@mui/material/Button/Button";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import {
  useAddAccount,
  useEditAccount,
} from "../../services/account/accountHooks.ts";
import { useSpeech } from "../../providers/SpeechProvider.tsx";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  account: Account | null;
};

const AddEditAccountDialog = (props: Props) => {
  const { speak, startListening, recognizedText } = useSpeech();

  const [id, setId] = useState<number>(0);
  const [accName, setAccName] = useState<string>("");
  const [accType, setAccType] = useState<AccountType | "">("");
  const [dess, setDesc] = useState<string>("");

  const addAccountRequest = useAddAccount();
  const editAccountRequest = useEditAccount();

  useEffect(() => {
    let loop = async () => {
      if (id == 0) {
        speak(
          "This is the interface for adding a new account. Please speak your account Name",
          () => setId(1)
        );
      } else if (id == 1) {
        startListening(async () => {
          console.log("acc name: ", recognizedText.current);
          setAccName(recognizedText.current);
          setId(2);
        });
      } else if (id == 2) {
        speak(
          "Please mention your Account type from the following options,Checking, Savings, Investing , Credit, Meal, Wallet,Other",
          () => setId(3)
        );
      } else if (id == 3) {
        startListening(async () => {
          let t = recognizedText.current.toLowerCase().trim();
          let ii = 4;
          console.log("account type: ", t);
          if (t == "checking") {
            setAccType(AccountType.Checking);
          } else if (t == "savings") {
            setAccType(AccountType.Savings);
          } else if (t == "investing") {
            setAccType(AccountType.Investing);
          } else if (t == "credit") {
            setAccType(AccountType.Credit);
          } else if (t == "meal") {
            setAccType(AccountType.Meal);
          } else if (t == "wallet") {
            setAccType(AccountType.Wallet);
          } else if (t == "other") {
            setAccType(AccountType.Other);
          } else {
            speak("Invalid type: " + t, () => {
              ii = 2;
            });
          }
          setId(ii);
          // setPassword(recognizedText.current);
        });
      } else if (id == 4) {
        speak("Please describe your account's description", () => setId(5));
      } else if (id == 5) {
        startListening(async () => {
          console.log("description ", recognizedText.current);
          setDesc(recognizedText.current);
          setId(6);
        });
      } else if (id == 6) {
        if (isEditForm) {
          editAccountRequest.mutate({
            account_id: props.account?.account_id
              ? props.account.account_id
              : BigInt(1),
            new_name: nameValue,
            new_type: typeValue as AccountType,
            new_status: statusValue,
            new_description: descriptionValue,
            exclude_from_budgets: excludeFromBudgetsValue,
            color_gradient: colorValue as ColorGradient,
          });
        } else {
          addAccountRequest.mutate({
            name: accName,
            type: accType as AccountType,
            status: AccountStatus.Active,
            description: dess,
            exclude_from_budgets: false,
            color_gradient: ColorGradient.Blue as ColorGradient,
          });
        }
      }
    };
    loop();
  }, [id]);

  const isEditForm = props.account !== null;

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const [excludeFromBudgetsValue, setExcludeFromBudgetsValue] = useState(
    props.account?.exclude_from_budgets == true
  );
  const colorOptions = Object.values(ColorGradient);
  const [colorValue, setColorValue] = useState<string>(
    props.account?.color_gradient || colorOptions[0]
  );
  const [statusValue, setStatusValue] = useState<AccountStatus>(
    props.account?.status || AccountStatus.Active
  );
  const [nameValue, setNameValue] = useState<string>(props.account?.name || "");
  const [descriptionValue, setDescriptionValue] = useState<string>(
    props.account?.description || ""
  );
  const [typeValue, setTypeValue] = useState<AccountType | "">(
    props.account?.type || ""
  );
  const typeOptions = Object.values(AccountType);

  // Loading
  useEffect(() => {
    if (addAccountRequest.isPending || editAccountRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addAccountRequest.isPending, editAccountRequest.isPending]);

  // Error
  useEffect(() => {
    if (addAccountRequest.isError || editAccountRequest.isError) {
      snackbar.showSnackbar(
        t("common.somethingWentWrongTryAgain"),
        AlertSeverity.ERROR
      );
    }
  }, [addAccountRequest.isError, editAccountRequest.isError]);

  // Success
  useEffect(() => {
    if (addAccountRequest.isSuccess || editAccountRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [addAccountRequest.isSuccess, editAccountRequest.isSuccess]);

  const onAccountStatusSelected = (
    _: React.MouseEvent<HTMLElement>,
    newStatus: string | null
  ) => {
    if (
      newStatus !== null &&
      Object.values(AccountStatus).includes(newStatus as AccountStatus)
    ) {
      setStatusValue(newStatus as AccountStatus);
    }
  };

  const ColorOptionsSelect = ({ selectedColor }: { selectedColor: string }) => (
    <TextField
      fullWidth
      select
      margin="dense"
      id="color-select"
      value={selectedColor}
      onChange={(event) => setColorValue(event.target.value)}
      label={t("accounts.color")}
    >
      {colorOptions.map((color) => (
        <MenuItem key={color} value={color}>
          <div
            style={{
              margin: "0 auto",
              background: cssGradients[color] ?? "",
              width: 60,
              height: 20,
              borderRadius: 20,
            }}
          ></div>
        </MenuItem>
      ))}
    </TextField>
  );

  const AccountStatusToggle = ({
    selectedStatus,
    onChange,
  }: {
    selectedStatus: string;
    onChange: (event: React.MouseEvent<HTMLElement>, value: string) => void;
  }) => (
    <ToggleButtonGroup
      exclusive
      value={selectedStatus}
      onChange={onChange}
      color="primary"
    >
      <ToggleButton value={AccountStatus.Active}>
        <Stack direction="row" spacing={1}>
          <PlayArrow />
          <Typography variant="body1">{t("accounts.active")}</Typography>
        </Stack>
      </ToggleButton>
      <ToggleButton value={AccountStatus.Inactive}>
        <Stack direction="row" spacing={1}>
          <AcUnit />
          <Typography variant="body1">{t("accounts.inactive")}</Typography>
        </Stack>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (isEditForm && props.account) {
            // Update
            editAccountRequest.mutate({
              account_id: props.account.account_id,
              new_name: nameValue,
              new_type: typeValue as AccountType,
              new_status: statusValue,
              new_description: descriptionValue,
              exclude_from_budgets: excludeFromBudgetsValue,
              color_gradient: colorValue as ColorGradient,
            });
          } else {
            // Create
            addAccountRequest.mutate({
              name: nameValue,
              type: typeValue as AccountType,
              status: statusValue,
              description: descriptionValue,
              exclude_from_budgets: excludeFromBudgetsValue,
              color_gradient: colorValue as ColorGradient,
            });
          }
        },
      }}
    >
      <DialogTitle>
        <Grid container>
          <Grid xs={12} md={10}>
            <Stack>
              <Trans
                i18nKey={
                  isEditForm
                    ? "accounts.editAccountModalTitle"
                    : "accounts.addNewAccountModalTitle"
                }
                values={{
                  name: props.account?.name,
                }}
              />
              {/* Exclude from budgets */}
              <FormControlLabel
                sx={{ width: "fit-content" }}
                control={
                  <Checkbox
                    icon={<RemoveCircleOutline />}
                    checkedIcon={<RemoveCircle />}
                  />
                }
                checked={excludeFromBudgetsValue}
                label={t("accounts.excludeFromBudgets")}
                name="exclude_from_budgets"
                onChange={(_e, checked) => setExcludeFromBudgetsValue(checked)}
              />
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={2}
            display="flex"
            justifyContent="flex-end"
            sx={{ height: "fit-content" }}
          >
            <AccountStatusToggle
              selectedStatus={statusValue}
              onChange={onAccountStatusSelected}
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid container spacing={2} xs={12} columns={{ xs: 1, md: 12 }}>
            <Grid md={6} xs={12}>
              {/* Name */}
              <TextField
                required
                margin="dense"
                id="name"
                name="name"
                value={nameValue || ""}
                onChange={(e) => setNameValue(e.target.value)}
                label={t("accounts.name")}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid md={4} xs={12}>
              {/* Type */}
              <TextField
                fullWidth
                select
                margin="dense"
                id="type"
                name="type"
                value={typeValue}
                onChange={(event) =>
                  setTypeValue(event.target.value as AccountType | "")
                }
                label={t("accounts.type")}
              >
                {typeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`accounts.${type.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={2} display="flex" justifyContent="flex-end">
              <ColorOptionsSelect selectedColor={colorValue} />
            </Grid>
            <Grid xs={12}>
              {/* Description */}
              <TextField
                margin="dense"
                id="description"
                name="description"
                value={descriptionValue || ""}
                onChange={(e) => setDescriptionValue(e.target.value)}
                label={t("common.description")}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Undo />}
          onClick={props.onNegativeClick}
        >
          {t("common.cancel")}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? "common.edit" : "common.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditAccountDialog;
