import { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AccountBalanceWalletOutlined,
  BookmarksOutlined,
  BusinessOutlined,
  DashboardOutlined,
  DisplaySettingsOutlined,
  DonutLargeOutlined,
  FolderSharedOutlined,
  InsertChartOutlined,
  LocalOfferOutlined,
  MenuOutlined,
  PaymentsOutlined,
  TipsAndUpdatesOutlined,
} from '@mui/icons-material';
import { alpha, useMediaQuery, useTheme } from '@mui/material';
import {
  ROUTE_ACCOUNTS,
  ROUTE_BUDGETS,
  ROUTE_CATEGORIES,
  ROUTE_DASHBOARD,
  ROUTE_ENTITIES,
  ROUTE_INVEST,
  ROUTE_RULES,
  ROUTE_STATS,
  ROUTE_TAGS,
  ROUTE_TRX,
} from '../providers/RoutesProvider';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '../providers/SpeechProvider';

const MyFinSidebar = () => {
  const theme = useTheme();
  const matchesMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setCollapsed] = useState(matchesMdScreen);
  const { t } = useTranslation();

  function toggleSidebarCollapse() {
    setCollapsed(!isCollapsed);
  }
  const { recognizedText, isListening, startListening, stopListening, speak } = useSpeech();
  const navigate = useNavigate();
  return (
    <div>
      <div onMouseDown={(ev) => {
			if (ev.button == 1) {
				ev.preventDefault(); 
				startListening(async () => {
					console.log(recognizedText.current);
					fetch("http://localhost:8000/api/talk", {
						method: "POST", // Specify GET method
						headers: {
						  "Content-Type": "application/json", // Optional, for JSON payload
						},
						body: JSON.stringify({ "message": recognizedText.current}), // Include a body (not typical for GET)
					  }).then(async (res)=> {
						// console.log(res);
						// console.log(await res.json());
						let data = await res.json();
						console.log(data);  
            let func_name = data.command.substring(4);
						if(data.command.substring(0,3) == "Nav") {
              navigate("/" + func_name.toLowerCase())
            }else if(data.command.includes("Dialog")){
              window[func_name](true);
            }else{
              window[func_name]();
            }
						console.log(func_name);
						// console.log(window);
					  })
				});
			}
		}}>
      <Sidebar
        style={{ height: '100vh', top: 0, border: 0 }}
        backgroundColor={theme.palette.background.paper}
        collapsed={isCollapsed}
      >
        <Menu
          menuItemStyles={{
            button: {
              // the active class will be added automatically by react router
              // so we can use it to style the active menu item
              backgroundColor: theme.palette.background.paper,
              [`&.active`]: {
                backgroundColor: theme.palette.background.default,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 0.3),
              },
            },
            subMenuContent: {
              backgroundColor: 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 1.0),
              },
            },
          }}
        >
          <MenuItem
            icon={<MenuOutlined />}
            onClick={() => {
              toggleSidebarCollapse();
            }}
            style={{ textAlign: 'left', marginBottom: 10, marginTop: 20 }}
          >
            {' '}
            <img
              src={
                theme.palette.mode === 'dark'
                  ? '/res/logo_white_font_transparent_bg.png'
                  : '/res/logo_transparent_bg_v2.png'
              }
              style={{ width: '70%' }}
            />
          </MenuItem>
          <MenuItem
            icon={<DashboardOutlined />}
            component={<NavLink to={ROUTE_DASHBOARD} />}
            style={{ marginTop: 35 }}
          >
            {' '}
            {t('sidebar.dashboard')}
          </MenuItem>
          <MenuItem
            icon={<PaymentsOutlined />}
            component={<NavLink to={ROUTE_TRX} />}
          >
            {' '}
            {t('sidebar.transactions')}
          </MenuItem>
          <MenuItem
            icon={<BookmarksOutlined />}
            component={<NavLink to={ROUTE_BUDGETS} />}
          >
            {' '}
            {t('sidebar.budgets')}
          </MenuItem>
          <MenuItem
            icon={<AccountBalanceWalletOutlined />}
            component={<NavLink to={ROUTE_ACCOUNTS} />}
          >
            {' '}
            {t('sidebar.accounts')}
          </MenuItem>
          <MenuItem
            icon={<DonutLargeOutlined />}
            component={<NavLink to={ROUTE_INVEST} />}
          >
            {' '}
            {t('sidebar.investments')}
          </MenuItem>
          <SubMenu label={t('sidebar.meta')} icon={<DisplaySettingsOutlined />}>
            <MenuItem
              icon={<FolderSharedOutlined />}
              component={<NavLink to={ROUTE_CATEGORIES} />}
            >
              {' '}
              {t('sidebar.categories')}
            </MenuItem>
            <MenuItem
              icon={<BusinessOutlined />}
              component={<NavLink to={ROUTE_ENTITIES} />}
            >
              {' '}
              {t('sidebar.entities')}
            </MenuItem>
            <MenuItem
              icon={<LocalOfferOutlined />}
              component={<NavLink to={ROUTE_TAGS} />}
            >
              {' '}
              {t('sidebar.tags')}
            </MenuItem>
            <MenuItem
              icon={<TipsAndUpdatesOutlined />}
              component={<NavLink to={ROUTE_RULES} />}
            >
              {' '}
              {t('sidebar.rules')}
            </MenuItem>
          </SubMenu>
          <MenuItem
            icon={<InsertChartOutlined />}
            component={<NavLink to={ROUTE_STATS} />}
          >
            {' '}
            {t('sidebar.statistics')}
          </MenuItem>
          {/*<Divider />*/}
        </Menu>
      </Sidebar>
      </div>
    </div>
  );
};

export default MyFinSidebar;
