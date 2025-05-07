import React from 'react';
import styled from 'styled-components';
import ErrorLogger from '../utils/errorLogger';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 2rem;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;
`;

const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ErrorDetails = styled.pre`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: ${props => props.show ? 'block' : 'none'};
  max-height: 300px;
  overflow-y: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'secondary':
        return '#6c757d';
      case 'danger':
        return '#dc3545';
      default:
        return '#007bff';
    }
  }};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'secondary':
          return '#5a6268';
        case 'danger':
          return '#c82333';
        default:
          return '#0056b3';
      }
    }};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ErrorIcon = styled.span`
  font-size: 1.5rem;
`;

const ErrorInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // エラーログの送信
    ErrorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      location: window.location.href,
      retryCount: this.state.retryCount
    });
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // コンポーネントの再マウントを試みる
      await this.props.onRetry?.();
      
      this.setState({ 
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
    } catch (error) {
      this.setState({ isRetrying: false });
      ErrorLogger.logError(error, {
        operation: 'retry',
        retryCount: this.state.retryCount
      });
    }
  };

  handleReport = async () => {
    try {
      const errorLog = await ErrorLogger.logError(this.state.error, {
        componentStack: this.state.errorInfo?.componentStack,
        location: window.location.href,
        retryCount: this.state.retryCount,
        userReported: true
      });

      alert('エラーの報告が完了しました。ご協力ありがとうございます。');
    } catch (error) {
      alert('エラーの報告に失敗しました。');
    }
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = ErrorLogger.getErrorMessage(this.state.error);
      const isCritical = this.state.error?.code === 'critical';

      return (
        <ErrorContainer>
          <ErrorTitle>
            <ErrorIcon>⚠️</ErrorIcon>
            {isCritical ? '重大なエラーが発生しました' : 'エラーが発生しました'}
          </ErrorTitle>
          
          <ErrorMessage>{errorMessage}</ErrorMessage>
          
          <ErrorInfo>
            <p>エラーコード: {this.state.error?.code || 'unknown'}</p>
            <p>発生時刻: {new Date().toLocaleString()}</p>
            {this.state.retryCount > 0 && (
              <p>再試行回数: {this.state.retryCount}回</p>
            )}
          </ErrorInfo>
          
          <ErrorDetails show={this.state.showDetails}>
            {this.state.error?.stack}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </ErrorDetails>

          <ButtonGroup>
            <Button 
              onClick={this.handleRetry}
              disabled={this.state.isRetrying}
            >
              {this.state.isRetrying ? '再試行中...' : '再試行'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={this.toggleDetails}
            >
              {this.state.showDetails ? '詳細を隠す' : '詳細を表示'}
            </Button>
            
            <Button 
              variant="danger" 
              onClick={this.handleReport}
            >
              エラーを報告
            </Button>
          </ButtonGroup>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 