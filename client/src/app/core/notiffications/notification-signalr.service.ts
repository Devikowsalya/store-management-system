import { Injectable, signal } from '@angular/core';

import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel
} from '@microsoft/signalr';

import { environment } from '../../../environments/environment';

import {
    OrderStatusNotification as Notification
} from './notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationSignalrService {
    private hubConnection:
        HubConnection | null = null;

    private readonly _receivedNotification =
        signal<Notification | null>(null);

    private readonly _isConnected =
        signal<boolean>(false);

    readonly receivedNotification =
        this._receivedNotification.asReadonly();

    readonly isConnected =
        this._isConnected.asReadonly();

    async startConnection(): Promise<void> {
        const rawToken =
            localStorage.getItem('token');

        if (!rawToken) {
            console.warn(
                'SignalR connection not started: token missing.'
            );

            return;
        }

        const token = rawToken
            .replace(/^Bearer\s+/i, '')
            .trim()
            .replace(/^"+|"+$/g, '');

        if (
            this.hubConnection?.state ===
            HubConnectionState.Connected ||
            this.hubConnection?.state ===
            HubConnectionState.Connecting ||
            this.hubConnection?.state ===
            HubConnectionState.Reconnecting
        ) {
            return;
        }

        const configuration = environment as {
            apiUrl?: string;
            signalRHubUrl?: string;
        };

        const apiUrl =
            configuration.apiUrl ??
            'https://localhost:7288/api';

        const baseUrl = apiUrl.replace(
            /\/api\/?$/i,
            ''
        );

        const hubUrl =
            configuration.signalRHubUrl ??
            `${baseUrl}/notificationHub`;

        const connection =
            new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => token
                })
                .withAutomaticReconnect([
                    0,
                    2000,
                    5000,
                    10000
                ])
                .configureLogging(LogLevel.Warning)
                .build();

        this.hubConnection = connection;

        this.registerSignalREvents(connection);

        try {
            await connection.start();

            this._isConnected.set(true);

            console.log(
                `Notification SignalR connected successfully to ${hubUrl}`
            );
        } catch (error) {
            this._isConnected.set(false);

            connection.off(
                'ReceiveNotification'
            );

            if (this.hubConnection === connection) {
                this.hubConnection = null;
            }

            console.error(
                'Notification SignalR connection failed:',
                error
            );
        }
    }

    private registerSignalREvents(
        connection: HubConnection
    ): void {
        connection.off('ReceiveNotification');

        connection.on(
            'ReceiveNotification',
            (notification: Notification) => {
                console.log(
                    'Live notification received through SignalR:',
                    notification
                );

                this._receivedNotification.set(
                    notification
                );
            }
        );

        connection.onreconnecting(error => {
            this._isConnected.set(false);

            console.warn(
                'Notification SignalR reconnecting:',
                error
            );
        });

        connection.onreconnected(
            connectionID => {
                this._isConnected.set(true);

                console.log(
                    'Notification SignalR reconnected:',
                    connectionID
                );
            }
        );

        connection.onclose(error => {
            this._isConnected.set(false);

            if (this.hubConnection === connection) {
                this.hubConnection = null;
            }

            if (error) {
                console.warn(
                    'Notification SignalR disconnected:',
                    error
                );
            }
        });
    }

    async stopConnection(): Promise<void> {
        const connection =
            this.hubConnection;

        if (!connection) {
            this._isConnected.set(false);
            this._receivedNotification.set(null);

            return;
        }

        this.hubConnection = null;

        connection.off(
            'ReceiveNotification'
        );

        try {
            await connection.stop();
        } catch (error) {
            console.warn(
                'Error while stopping SignalR:',
                error
            );
        } finally {
            this._isConnected.set(false);
            this._receivedNotification.set(null);
        }
    }
}