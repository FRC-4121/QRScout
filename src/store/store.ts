import { produce } from 'immer';
import { ChangeEvent } from 'react';
import configJson from '../../config/2024/config.json';
import { Config } from '../components/inputs/BaseInputProps';
import { createStore } from './createStore';

function buildConfig(c: Config) {
  let config: Config = { ...c };
  config.sections
    .map(s => s.fields)
    .flat()
    .forEach(f => (f.value = f.defaultValue));
  return config;
}

function getDefaultConfig(): Config {
  return buildConfig(configJson as Config);
}

export interface QRScoutState {
  formData: Config;
  showQR: boolean;
}

const initialState: QRScoutState = {
  formData: getDefaultConfig(),
  showQR: false,
};

export const useQRScoutState = createStore<QRScoutState>(
  initialState,
  'qrScout',
  {
    version: 1,
  },
);

export function resetToDefaultConfig() {
  useQRScoutState.setState(initialState);
}

export function updateValue(sectionName: string, code: string, data: any) {
  useQRScoutState.setState(
    produce((state: QRScoutState) => {
      let section = state.formData.sections.find(s => s.name === sectionName);
      if (section) {
        let field = section.fields.find(f => f.code === code);
        if (field) {
          field.value = data;
        }
      }
    }),
  );
}

export function resetSections() {
  useQRScoutState.setState(
    produce((state: QRScoutState) =>
      state.formData.sections
        .filter(s => !s.preserveDataOnReset)
        .map(s => s.fields)
        .flat()
        .forEach(f => {
          if (!f.preserveDataOnReset) {
            f.value = f.defaultValue;
          }
        }),
    ),
  );
}

export function setFormData(config: Config) {
  useQRScoutState.setState({ formData: buildConfig(config) });
}

export function uploadConfig(evt: ChangeEvent<HTMLInputElement>) {
  var reader = new FileReader();
  reader.onload = function (e) {
    const configText = e.target?.result as string;
    const jsonData = JSON.parse(configText);
    setFormData(jsonData as Config);
  };
  if (evt.currentTarget.files && evt.currentTarget.files.length > 0) {
    reader.readAsText(evt.currentTarget.files[0]);
  }
}

export const inputSelector =
  (section: string, code: string) => (state: QRScoutState) => {
    const formData = state.formData;
    return formData.sections
      .find(s => s.name === section)
      ?.fields.find(f => f.code === code);
  };

export function getFieldValue(code: string) {
  return useQRScoutState
    .getState()
    .formData.sections.map(s => s.fields)
    .flat()
    .find(f => f.code === code)?.value;
}

export interface ApiUrlState {
  url?: string;
  auth?: string;
};
export const useApiState = createStore<ApiUrlState>({}, 'qrScoutApi', {
  version: 1
});
