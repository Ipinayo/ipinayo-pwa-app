import { toast } from "sonner";

type ToastMessages<T = any, E = any> = {
    success?: string | ((result: T) => string);
    error?: string | ((error: E) => string);
    loading?: string;
};

type WithToastResult<T, E = Error> = {
    data?: T;
    error?: E;
};

export async function withToast<T, E = Error>(
    action: () => Promise<T>,
    messages: ToastMessages<T, E> = {}
): Promise<WithToastResult<T, E>> {
    const { loading, success, error } = messages;
    try {
        const promise = action();

        toast.promise(promise, {
            loading: loading,
            success: (res) =>
                typeof success === "function"
                    ? success(res)
                    : (success ?? (res && typeof res === "object" && "data" in res && typeof res.data === "object" && "message" in (res as any).data ? (res as any).data.message : "Success!")),
            error: (err) =>
                typeof error === "function"
                    ? error(err)
                    : (error ?? err.message ?? "An unexpected error occurred"),
        }
        );

        const data = await promise;

        return { data };
    } catch (err: any) {
        return { error: err };
    }
}
