// types.ts
export const RootStackParamList = {
  SplashScreen: undefined,
  NextScreen: undefined,
  ReportAnimalScreen: { mobileNumber: '' }, // Add mobileNumber parameter here
  ReportsScreen: undefined,
  ApplyForRescueScreen: undefined,
  SignupScreen: undefined,
  LoginScreen: undefined,
  PublicHomeScreen: { mobileNumber: '' }, // Add mobileNumber parameter here if needed
  RescuerHomeScreen: { mobileNumber: '' }, // Add mobileNumber parameter here if needed
  AdminHomeScreen: { mobileNumber: '' },
  DosAndDontsScreen: undefined,
  RescuesScreen: undefined,
  AddRescuerScreen: { adminMobileNumber: '' },
  UnassignedScreen: undefined,
  PendingRescuesScreen: undefined,
  TaskToCompleteScreen: undefined,
  AddAdminScreen: undefined,
  SupAdminScreen: undefined,
  ForgotPasswordScreen: undefined,
};
