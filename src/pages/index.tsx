import ChatGPT from '@/components/ChatGPT'
import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'

import FooterBar from '@/components/FooterBar'
import HeaderBar from '@/components/HeaderBar'

import styles from './index.module.less'
import { useState } from 'react'
import LanguageContext from '../components/Context/targetLanguageContext' 
import LanguageBar from '@/components/LanguageBar'

export default function Home() {
  const [targetLanguage, setTargetLanguaage] = useState({targetLanguage: '英文'});
  
  const updateTargetLanguage = (targetLanguage: string) => {
    setTargetLanguaage({targetLanguage: targetLanguage});
  };



  return (
    <LanguageContext.Provider value={{ ...targetLanguage, updateTargetLanguage }}>
      <Layout hasSider className={styles.layout}>
        <Layout>
          <HeaderBar />
          <LanguageBar />
          <Content className={styles.main}>
            <ChatGPT fetchPath="/api/chat-completion" />
          </Content>
          <FooterBar />
        </Layout>
      </Layout>
    </LanguageContext.Provider>
    
  )
}
