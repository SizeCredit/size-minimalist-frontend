import Swap from './components/Swap'
import Sidebar from './components/Sidebar'
import { ToastContainer } from 'react-toastify';
import LoadingBar from 'react-top-loading-bar'
import { LimitOrdersContext } from './contexts/LimitOrdersContext';
import { useContext } from 'react';
import { PositionsContext } from './contexts/PositionsContext';

function App() {
  const {progress: limitOrdersProgress} = useContext(LimitOrdersContext)
  const {progress: positionsProgress} = useContext(PositionsContext)

  return (
    <>
    <LoadingBar progress={(limitOrdersProgress + positionsProgress) / 2} />
      <Swap/>
      <Sidebar/>
      <ToastContainer />
    </>
  )
}

export default App