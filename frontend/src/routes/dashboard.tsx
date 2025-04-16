import { createFileRoute } from '@tanstack/react-router';
import { Overview } from '../components/Dashboard/Overview';

export const Route = createFileRoute('/dashboard')();

export const Component = Overview;

export default Route;
