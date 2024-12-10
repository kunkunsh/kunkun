import { expose } from '@kunkun/api/runtime/deno';

expose({
	echo: (paths: string[]) => Promise.resolve(paths)
});
