import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
import {createDrawerNavigator} from 'react-navigation-drawer'
import LoginPage from './app/pages/login'
import { SignUpPage } from './app/pages/signup'
import VerifyPhonePage from './app/pages/verify-phone'
import { ForgotPasswordPage } from './app/pages/forgot-password'
import { VerifyForgotPasswordPage } from './app/pages/verify-forgot-password'
import { HomePage } from './app/pages/home'
import Drawer from './app/components/drawer'
import ProfilePage from './app/pages/profile'
import EditProfilePage from './app/pages/edit-profile'
import { BuyVehicleCoverPage } from './app/pages/forms/buy-cover'
import { ScanLicenseDiskPage } from './app/pages/scan-license-disk'
import { CameraPage } from './app/pages/camera'
import { PaymentPage } from './app/pages/payment'
import { HistoryPage } from './app/pages/history'
import { PoliciesPage } from './app/pages/policies'
import { ClaimPage } from './app/pages/forms/claim'
import { LocationPage } from './app/pages/location'
import { RoadsidePage } from './app/pages/forms/roadside'
import { PolicyPage } from './app/pages/policy'
import { UploadPolicyPhotosPage } from './app/pages/upload-policy-photos'
import ProfilePicturePage from './app/pages/profile-picture'
import LoadingPage from './app/pages/loading'
import { LicensePicturePage } from './app/pages/license-picture'
import { ViewDriverPage } from './app/pages/view-driver'
import { LocationRequiredPage } from './app/pages/location-required'
import { RoadsidePaymentPage } from './app/pages/roadside-payment'
import ErrorCodesPage from './app/pages/error-codes'
import AddDevicePage from './app/pages/add-device'
import { AccidentChecklistPage } from './app/pages/accident-checklist'
import { FriendLocationPage } from './app/pages/friend-location'

const HomeStack = createStackNavigator({
    Home: HomePage,
    Profile: ProfilePage,
    EditProfile: EditProfilePage,
    BuyVehicleCover: BuyVehicleCoverPage,
    Claim: ClaimPage,
    ScanLicenseDisk: ScanLicenseDiskPage,
    Camera: CameraPage,
    Payment: PaymentPage,
    RoadsidePayment: RoadsidePaymentPage,
    History: HistoryPage,
    Policies: PoliciesPage,
    Location: LocationPage,
    FriendLocation: FriendLocationPage,
    Roadside: RoadsidePage,
    Policy: PolicyPage,
    UploadPolicyPhotos: UploadPolicyPhotosPage,
    ViewDriver: ViewDriverPage,
    ErrorCodes: ErrorCodesPage,
    AddDevice: AddDevicePage,
    UpdateProfilePicture: ProfilePicturePage,
    AccidentChecklist: AccidentChecklistPage
}, {
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: '#000000',
          },
        headerTintColor: '#fff'
    }
})

const DrawerStack = createDrawerNavigator({
    App: HomeStack
  }, {
    contentComponent: Drawer,
    drawerWidth: 300,
  });

const AuthStack = createStackNavigator({
    Login: LoginPage,
    SignUp: SignUpPage,
    VerifyPhone: VerifyPhonePage,
    ForgotPassword: ForgotPasswordPage,
    VerifyForgotPassword: VerifyForgotPasswordPage,
    Home: DrawerStack,
    
}, {
    headerMode: 'none',
    initialRouteName: 'Home'
})

export default createAppContainer(createStackNavigator(
  {
      App: {
          screen: DrawerStack,
          navigationOptions: {
              header: null
          }
      },
      Auth: {
          screen: AuthStack,
          navigationOptions: {
              header: null
          }
      },
      ProfilePicture: ProfilePicturePage,
      Loading: LoadingPage,
      Camera: CameraPage,
      LicensePicture: LicensePicturePage,
      LocationRequired: LocationRequiredPage
  },
  {
      initialRouteName: 'Loading',
      headerMode: 'none'
  }
))