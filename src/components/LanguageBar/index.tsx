import React, { useContext } from 'react'

import { Select, Form} from 'antd'

import styles from './index.module.less'
import LanguageContext from '../Context/targetLanguageContext';

const { Option } = Select;

const LanguageBar = () => {
    const languageContext = useContext(LanguageContext);


    function handleChange(value: string) {
        languageContext?.updateTargetLanguage(value);
    }

    return (
        <Form>
        <Form.Item
          label="Target Language"
          name="select"
        >
          <Select defaultValue="英文" style={{ width: 120 }} onChange={handleChange}>
            <Option value="英文">English</Option>
            <Option value="中文">Chinese</Option>
            <Option value="法语">French</Option>
          </Select>
        </Form.Item>
        </Form>
      );
}


export default LanguageBar