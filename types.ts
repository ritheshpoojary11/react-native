// types.ts
export type RootStackParamList = {
  NextScreen: undefined;
  ReportAnimalScreen: { mobileNumber: string }; // Add mobileNumber parameter here
  ReportsScreen: undefined;
  ApplyForRescueScreen: undefined;
  SignupScreen: undefined;
  LoginScreen: undefined;
  PublicHomeScreen: { mobileNumber: string }; // Add mobileNumber parameter here if needed
  RescuerHomeScreen: { mobileNumber: string }; // Add mobileNumber parameter here if needed
  AdminHomeScreen: undefined;
  DosAndDontsScreen: undefined;
  RescuesScreen: undefined;
  AddRescuerScreen: undefined;
  UnassignedScreen: undefined;
  PendingRescuesScreen: undefined;
  TaskToCompleteScreen: undefined;
};
