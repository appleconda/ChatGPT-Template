import { gql } from "@apollo/client";

export const GET_USER = gql`
  query Query($userName: String!) {
    user(userName: $userName) {
      chat_next_web_store {
        sessions {
          id
          topic
          memoryPrompt
          messages {
            id
            date
            role
            content
            streaming
            model
          }
          stat {
            tokenCount
            wordCount
            charCount
          }
          lastUpdate
          lastSummarizeIndex
          mask {
            id
            avatar
            name
            context
            syncGlobalConfig
            modelConfig {
              model
              temperature
              top_p
              max_tokens
              presence_penalty
              frequency_penalty
              sendMemory
              historyMessageCount
              compressMessageLengthThreshold
              enableInjectSystemPrompts
              template
            }
            lang
            builtin
            createdAt
          }
        }
        currentSessionIndex
        lastUpdateTime
        userName
      }
      access_control {
        accessCode
        useCustomConfig
        provider
        openaiUrl
        openaiApiKey
        azureUrl
        azureApiKey
        azureApiVersion
        googleUrl
        googleApiKey
        googleApiVersion
        needCode
        hideUserApiKey
        hideBalanceQuery
        disableGPT4
        disableFastLink
        customModels
        lastUpdateTime
      }
      app_config {
        lastUpdate
        submitKey
        avatar
        fontSize
        theme
        tightBorder
        sendPreviewBubble
        enableAutoGenerateTitle
        sidebarWidth
        disablePromptHint
        dontShowMaskSplashScreen
        hideBuiltinMasks
        customModels
        models {
          name
          available
          provider {
            id
            providerName
            providerType
          }
        }
        modelConfig {
          model
          temperature
          top_p
          max_tokens
          presence_penalty
          frequency_penalty
          sendMemory
          historyMessageCount
          compressMessageLengthThreshold
          enableInjectSystemPrompts
          template
        }
        lastUpdateTime
      }
      mask_store {
        masks {
          id
          avatar
          name
          context
          syncGlobalConfig
          modelConfig {
            model
            temperature
            top_p
            max_tokens
            presence_penalty
            frequency_penalty
            sendMemory
            historyMessageCount
            compressMessageLengthThreshold
            enableInjectSystemPrompts
            template
          }
          lang
          builtin
          createdAt
        }
        lastUpdateTime
      }
      prompt_store {
        counter
        prompts {
          id
          isUser
          title
          content
          createdAt
        }
        lastUpdateTime
      }
    }
  }
`;

export const PUT_USER = gql`
  mutation NewInspectChatUser($data: newInspectChatUser!) {
    newInspectChatUser(Data: $data)
  }
`;

export const APPEND_MSG = gql`
  mutation Mutation($sessionId: String!, $message: MessageInput!) {
    appendMessage(sessionID: $sessionId, message: $message)
  }
`;

export const APPEND_SESS = gql`
  mutation Mutation($userName: String!, $session: SessionInput!) {
    appendSession(userName: $userName, session: $session)
  }
`;
