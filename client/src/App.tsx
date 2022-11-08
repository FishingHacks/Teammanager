import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Wrappers from './wrappers';

export default function App() {
	return (
		<>
			<Suspense
				fallback={
					<div className='grid place-items-center'>
						<h1 className='text-3xl'>Loading...</h1>
					</div>
				}
			>
				{/* You can replace "BrowserRouter with other react-router routers." */}
				<BrowserRouter>
					<Wrappers />
				</BrowserRouter>
			</Suspense>
		</>
	);
}
