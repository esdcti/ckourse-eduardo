export interface AppSettings {
  autoplay_next: boolean;
  resume_position: boolean;
  default_speed: number;
  default_volume: number;
  skip_forward_secs: number;
  skip_backward_secs: number;
  locale: string;
  gdrive_client_id?: string;
  gdrive_client_secret?: string;
  gdrive_access_token?: string;
  gdrive_refresh_token?: string;
}
