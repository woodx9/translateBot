import React from 'react';

// 定义Context中的数据类型
interface LanguageType {
  targetLanguage: string
  updateTargetLanguage: (name: string) => void;
}

// 创建Context
const LanguageContext = React.createContext<LanguageType | undefined>(undefined);

export default LanguageContext;