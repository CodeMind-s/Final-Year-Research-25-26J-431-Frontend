export interface PlanCreateHintResponse {
  notification: {
    si: string;
    ta: string;
    en: string;
  };
  description: {
    si: string;
    ta: string;
    en: string;
  };
  plandays: number;
  startdate: string;
}
