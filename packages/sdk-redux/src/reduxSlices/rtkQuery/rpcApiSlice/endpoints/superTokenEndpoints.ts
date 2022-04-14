import {getFramework, getSigner} from '../../../../sdkReduxConfig';
import {TransactionInfo} from '../../../argTypes';
import {registerNewTransactionAndReturnQueryFnResult} from '../../../transactionTrackerSlice/registerNewTransaction';
import {createTag} from '../../cacheTags/CacheTagTypes';
import {RpcEndpointBuilder} from '../rpcEndpointBuilder';

import {
    SuperTokenDowngradeMutation,
    SuperTokenTransferMutation,
    SuperTokenUpgradeAllowanceQuery,
    SuperTokenUpgradeMutation,
} from './superTokenArgs';

export const createSuperTokenEndpoints = (builder: RpcEndpointBuilder) => ({
    superTokenUpgrade: builder.mutation<TransactionInfo, SuperTokenUpgradeMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const transactionResponse = await superToken
                .upgrade({
                    amount: arg.amountWei,
                })
                .exec(signer);

            return await registerNewTransactionAndReturnQueryFnResult({
                transactionResponse,
                chainId: arg.chainId,
                signer: await signer.getAddress(),
                waitForConfirmation: !!arg.waitForConfirmation,
                dispatch: queryApi.dispatch,
                title: 'Upgrade to Super Token',
                extraData: arg.transactionExtraData,
            });
        },
    }),
    superTokenUpgradeAllowance: builder.query<string, SuperTokenUpgradeAllowanceQuery>({
        queryFn: async (arg) => {
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            return {
                data: await superToken.underlyingToken.allowance({
                    providerOrSigner: framework.settings.provider,
                    owner: arg.accountAddress,
                    spender: superToken.address,
                }),
            };
        },
        providesTags: (_result, _error, arg) => [
            createTag('Balance', arg.chainId, arg.superTokenAddress, arg.accountAddress),
        ],
    }),
    superTokenDowngrade: builder.mutation<TransactionInfo, SuperTokenDowngradeMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const transactionResponse = await superToken
                .downgrade({
                    amount: arg.amountWei,
                })
                .exec(signer);

            return await registerNewTransactionAndReturnQueryFnResult({
                transactionResponse,
                chainId: arg.chainId,
                signer: await signer.getAddress(),
                waitForConfirmation: !!arg.waitForConfirmation,
                dispatch: queryApi.dispatch,
                title: 'Downgrade from Super Token',
                extraData: arg.transactionExtraData,
            });
        },
    }),
    superTokenTransfer: builder.mutation<TransactionInfo, SuperTokenTransferMutation>({
        queryFn: async (arg, queryApi) => {
            const signer = await getSigner(arg.chainId);
            const framework = await getFramework(arg.chainId);
            const superToken = await framework.loadSuperToken(arg.superTokenAddress);

            const transactionResponse = await superToken
                .transfer({
                    amount: arg.amountWei,
                    receiver: arg.receiverAddress,
                })
                .exec(signer);

            return await registerNewTransactionAndReturnQueryFnResult({
                transactionResponse,
                chainId: arg.chainId,
                signer: await signer.getAddress(),
                waitForConfirmation: !!arg.waitForConfirmation,
                dispatch: queryApi.dispatch,
                title: 'Transfer Super Token',
                extraData: arg.transactionExtraData,
            });
        },
    }),
});
